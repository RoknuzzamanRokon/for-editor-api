"""In-app notifications.

Authority model — enforced here, never in the endpoint or the client:

    super_user  -> may notify every user on the platform
    admin_user  -> may notify ONLY users they created (created_by_user_id == self)
    other roles -> receive only; sending raises 403

Every send path funnels through `_audience_pool_query`, so an audience can never
be widened by a crafted request body: an explicit user_ids list is intersected
with the caller's pool, and any id outside it is rejected outright rather than
silently dropped.

Recipients are fanned out into notification_recipients at send time. The audience
is therefore frozen to whoever was in scope when the message was sent — later
changes to a user's created_by_user_id never retroactively expose an old message.
"""

from datetime import datetime

from fastapi import HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from db.models import Notification, NotificationRecipient, RoleEnum, User


SENDER_ROLES = (RoleEnum.super_user, RoleEnum.admin_user)


def _audience_pool_query(db: Session, sender: User):
    """Base query for every user `sender` is permitted to notify.

    Excludes the sender themselves — a broadcast should not land in your own inbox.
    """
    if sender.role not in SENDER_ROLES:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not permitted to send notifications",
        )

    query = db.query(User).filter(User.id != sender.id)

    if sender.role == RoleEnum.admin_user:
        query = query.filter(User.created_by_user_id == sender.id)

    return query


def resolve_recipients(
    db: Session,
    sender: User,
    audience: str,
    user_ids: list[int],
) -> list[User]:
    pool = _audience_pool_query(db, sender)

    if audience == "all":
        if sender.role != RoleEnum.super_user:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only a super user can notify every user",
            )
        return pool.all()

    if audience == "my_users":
        return pool.filter(User.created_by_user_id == sender.id).all()

    # audience == "selected"
    unique_ids = {int(value) for value in user_ids}
    if not unique_ids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Select at least one recipient",
        )

    recipients = pool.filter(User.id.in_(unique_ids)).all()

    # Fail loudly on out-of-scope ids so an admin learns they targeted someone
    # they do not own, instead of the message quietly reaching fewer people.
    if len(recipients) != len(unique_ids):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="One or more selected users are outside your allowed audience",
        )

    return recipients


def list_audience(db: Session, sender: User) -> tuple[str, list[User]]:
    """The recipient picker's option list, plus a label for what the pool means."""
    users = _audience_pool_query(db, sender).order_by(User.id.asc()).all()
    scope = "all" if sender.role == RoleEnum.super_user else "created_by_me"
    return scope, users


def create_notification(
    db: Session,
    sender: User,
    title: str,
    message: str,
    category: str,
    audience: str,
    user_ids: list[int],
) -> Notification:
    recipients = resolve_recipients(db, sender, audience, user_ids)

    if not recipients:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No users matched that audience",
        )

    notification = Notification(
        sender_user_id=sender.id,
        title=title.strip(),
        message=message.strip(),
        category=category,
        audience=audience,
        recipient_count=len(recipients),
    )
    db.add(notification)
    db.flush()

    db.add_all(
        [
            NotificationRecipient(notification_id=notification.id, user_id=user.id)
            for user in recipients
        ]
    )
    db.commit()
    db.refresh(notification)
    return notification


def count_unread(db: Session, user: User) -> int:
    return (
        db.query(NotificationRecipient)
        .filter(
            NotificationRecipient.user_id == user.id,
            NotificationRecipient.is_read.is_(False),
        )
        .count()
    )


def list_inbox(
    db: Session,
    user: User,
    limit: int,
    offset: int,
    unread_only: bool = False,
) -> tuple[int, int, list[tuple[NotificationRecipient, Notification, User | None]]]:
    """Returns (total, unread, rows) where each row is (recipient, notification, sender)."""
    base = db.query(NotificationRecipient).filter(NotificationRecipient.user_id == user.id)
    if unread_only:
        base = base.filter(NotificationRecipient.is_read.is_(False))

    total = base.count()
    unread = count_unread(db, user)

    query = (
        db.query(NotificationRecipient, Notification, User)
        .join(Notification, NotificationRecipient.notification_id == Notification.id)
        .outerjoin(User, Notification.sender_user_id == User.id)
        .filter(NotificationRecipient.user_id == user.id)
    )
    if unread_only:
        query = query.filter(NotificationRecipient.is_read.is_(False))

    rows = (
        query.order_by(Notification.created_at.desc(), Notification.id.desc())
        .limit(limit)
        .offset(offset)
        .all()
    )
    return total, unread, rows


def mark_read(db: Session, user: User, recipient_ids: list[int] | None = None) -> int:
    """Marks the caller's own unread rows as read. Always scoped to user_id, so a
    caller can never flip someone else's read state by guessing ids."""
    query = db.query(NotificationRecipient).filter(
        NotificationRecipient.user_id == user.id,
        NotificationRecipient.is_read.is_(False),
    )

    if recipient_ids is not None:
        unique_ids = {int(value) for value in recipient_ids}
        if not unique_ids:
            return 0
        query = query.filter(NotificationRecipient.id.in_(unique_ids))

    updated = query.update(
        {
            NotificationRecipient.is_read: True,
            NotificationRecipient.read_at: datetime.utcnow(),
        },
        synchronize_session=False,
    )
    db.commit()
    return updated


def list_sent(
    db: Session,
    sender: User,
    limit: int,
    offset: int,
) -> tuple[int, list[Notification], dict[int, int]]:
    """Sent history. A super_user sees every notification sent on the platform;
    an admin_user sees only their own — mirroring the points giving-history rule."""
    if sender.role not in SENDER_ROLES:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not permitted to view sent notifications",
        )

    base = db.query(Notification)
    if sender.role != RoleEnum.super_user:
        base = base.filter(Notification.sender_user_id == sender.id)

    total = base.count()
    rows = (
        base.order_by(Notification.created_at.desc(), Notification.id.desc())
        .limit(limit)
        .offset(offset)
        .all()
    )

    read_counts: dict[int, int] = {}
    if rows:
        counts = (
            db.query(
                NotificationRecipient.notification_id,
                func.count(NotificationRecipient.id),
            )
            .filter(
                NotificationRecipient.notification_id.in_([row.id for row in rows]),
                NotificationRecipient.is_read.is_(True),
            )
            .group_by(NotificationRecipient.notification_id)
            .all()
        )
        read_counts = {notification_id: count for notification_id, count in counts}

    return total, rows, read_counts


def delete_notification(db: Session, actor: User, notification_id: int) -> None:
    """Retracts a message from every inbox it landed in. The sender may delete
    their own; a super_user may delete any."""
    notification = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notification:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")

    if actor.role != RoleEnum.super_user and notification.sender_user_id != actor.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not permitted to delete this notification",
        )

    db.query(NotificationRecipient).filter(
        NotificationRecipient.notification_id == notification_id
    ).delete(synchronize_session=False)
    db.delete(notification)
    db.commit()


def purge_user_notifications(db: Session, user_id: int) -> None:
    """FK cleanup for account deletion. Drops the user's inbox rows, then any
    message they sent (and its remaining recipient rows). Caller commits."""
    db.query(NotificationRecipient).filter(
        NotificationRecipient.user_id == user_id
    ).delete(synchronize_session=False)

    sent_ids = [
        row.id
        for row in db.query(Notification.id).filter(Notification.sender_user_id == user_id).all()
    ]
    if sent_ids:
        db.query(NotificationRecipient).filter(
            NotificationRecipient.notification_id.in_(sent_ids)
        ).delete(synchronize_session=False)
        db.query(Notification).filter(Notification.id.in_(sent_ids)).delete(
            synchronize_session=False
        )
