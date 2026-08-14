"""In-app notification endpoints.

Send authority (super_user = everyone, admin_user = only users they created) is
resolved entirely inside services.notifications — see that module's docstring.
The inbox/read routes are open to every authenticated role and are always scoped
to the caller's own rows.
"""

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from core.deps import get_current_user, require_role
from db.models import RoleEnum, User
from db.session import get_db
from models.notifications import (
    AudienceResponse,
    AudienceUserEntry,
    InboxEntry,
    InboxList,
    MarkReadResponse,
    NotificationCreateRequest,
    NotificationCreateResponse,
    NotificationSenderSummary,
    SentEntry,
    SentList,
    UnreadCountResponse,
)
from services import notifications as notification_service

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("/", response_model=InboxList)
def get_inbox(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    unread_only: bool = Query(False),
) -> InboxList:
    total, unread, rows = notification_service.list_inbox(
        db, current_user, limit=limit, offset=offset, unread_only=unread_only
    )

    items = [
        InboxEntry(
            id=recipient.id,
            notification_id=notification.id,
            title=notification.title,
            message=notification.message,
            category=notification.category,
            is_read=bool(recipient.is_read),
            read_at=recipient.read_at,
            created_at=notification.created_at,
            sender=(
                NotificationSenderSummary(
                    id=sender.id,
                    email=sender.email,
                    username=sender.username,
                    role=sender.role.value if hasattr(sender.role, "value") else str(sender.role),
                )
                if sender
                else None
            ),
        )
        for recipient, notification, sender in rows
    ]

    return InboxList(total=total, unread=unread, limit=limit, offset=offset, items=items)


@router.get("/unread-count", response_model=UnreadCountResponse)
def get_unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> UnreadCountResponse:
    return UnreadCountResponse(unread=notification_service.count_unread(db, current_user))


@router.post("/read", response_model=MarkReadResponse)
def mark_notifications_read(
    payload: dict | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> MarkReadResponse:
    """Marks specific inbox rows read via {"ids": [...]}, or the whole inbox when
    no ids are supplied."""
    recipient_ids = None
    if payload and isinstance(payload.get("ids"), list):
        recipient_ids = [int(value) for value in payload["ids"]]

    updated = notification_service.mark_read(db, current_user, recipient_ids)
    return MarkReadResponse(
        updated=updated,
        unread=notification_service.count_unread(db, current_user),
    )


@router.get("/audience", response_model=AudienceResponse)
def get_audience(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role(RoleEnum.super_user, RoleEnum.admin_user)
    ),
) -> AudienceResponse:
    """Users the caller may notify — populates the recipient picker."""
    scope, users = notification_service.list_audience(db, current_user)
    return AudienceResponse(
        scope=scope,
        total=len(users),
        items=[AudienceUserEntry.model_validate(user) for user in users],
    )


@router.get("/sent", response_model=SentList)
def get_sent(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role(RoleEnum.super_user, RoleEnum.admin_user)
    ),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
) -> SentList:
    total, rows, read_counts = notification_service.list_sent(
        db, current_user, limit=limit, offset=offset
    )

    items = [
        SentEntry(
            id=row.id,
            title=row.title,
            message=row.message,
            category=row.category,
            audience=row.audience,
            recipient_count=row.recipient_count,
            read_count=read_counts.get(row.id, 0),
            created_at=row.created_at,
        )
        for row in rows
    ]

    return SentList(total=total, limit=limit, offset=offset, items=items)


@router.post("/", response_model=NotificationCreateResponse, status_code=status.HTTP_201_CREATED)
def send_notification(
    payload: NotificationCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role(RoleEnum.super_user, RoleEnum.admin_user)
    ),
) -> NotificationCreateResponse:
    notification = notification_service.create_notification(
        db,
        current_user,
        title=payload.title,
        message=payload.message,
        category=payload.category,
        audience=payload.audience,
        user_ids=payload.user_ids,
    )

    return NotificationCreateResponse(
        id=notification.id,
        audience=notification.audience,
        recipient_count=notification.recipient_count,
        created_at=notification.created_at,
    )


@router.delete("/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role(RoleEnum.super_user, RoleEnum.admin_user)
    ),
) -> None:
    notification_service.delete_notification(db, current_user, notification_id)
