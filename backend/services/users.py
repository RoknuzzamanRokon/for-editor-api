from datetime import datetime, timedelta

from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from core.config import settings
from core.permissions import validate_action
from core.points import DEFAULT_ROLE_POINTS, topup_points
from core.security import get_password_hash
from db.models import (
    Conversion,
    PointsLedger,
    PointsTopup,
    PointsTopupRequest,
    RefreshToken,
    RoleEnum,
    User,
    UserConversionPermission,
    UserPoints,
    UserPreference,
)
from models.auth import DemoRegisterRequest, UserCreate

DEMO_SELF_REGISTER_POINTS = 33
DEMO_TRIAL_DAYS = 8
DEMO_MAX_ACTIONS = 3


def get_user_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == email).first()


def get_user_by_id(db: Session, user_id: int) -> User | None:
    return db.query(User).filter(User.id == user_id).first()


def is_demo_expired(user: User) -> bool:
    return (
        user.role == RoleEnum.demo_user
        and user.demo_expires_at is not None
        and user.demo_expires_at <= datetime.utcnow()
    )


def _ensure_unique_username(db: Session, username: str) -> str:
    base = username.strip() or "demo_user"
    candidate = base
    suffix = 1
    while db.query(User).filter(User.username == candidate).first():
        suffix += 1
        candidate = f"{base}_{suffix}"
    return candidate


def _derive_username_from_email(email: str) -> str:
    prefix = email.split("@")[0].strip()
    return prefix or "demo_user"


def _seed_user_permissions(
    db: Session,
    user_id: int,
    selected_actions: list[str],
    acting_user_id: int | None,
) -> None:
    for action in selected_actions:
        validate_action(action)

    unique_actions = list(dict.fromkeys(selected_actions))
    if len(unique_actions) == 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Select at least one API")
    if len(unique_actions) > DEMO_MAX_ACTIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"You can select up to {DEMO_MAX_ACTIONS} APIs",
        )

    for action in unique_actions:
        db.add(
            UserConversionPermission(
                user_id=user_id,
                action=action,
                is_allowed=True,
                created_by=acting_user_id,
                updated_by=acting_user_id,
            )
        )


def list_users(db: Session, current_user: User) -> list[User]:
    query = db.query(User)

    if current_user.role == RoleEnum.admin_user:
        query = query.filter(User.created_by_user_id == current_user.id)

    return query.order_by(User.id.asc()).all()


def create_user(
    db: Session,
    user_in: UserCreate,
    created_by_user: User | None = None,
) -> User:
    role = user_in.role or RoleEnum.general_user
    created_by_role = created_by_user.role if created_by_user else None

    if created_by_role == RoleEnum.admin_user and role == RoleEnum.super_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin cannot create super_user")

    if get_user_by_email(db, user_in.email):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    if user_in.username:
        existing_username = db.query(User).filter(User.username == user_in.username).first()
        if existing_username:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already taken")

    user = User(
        email=user_in.email,
        username=user_in.username,
        hashed_password=get_password_hash(user_in.password),
        role=role,
        is_active=True,
        created_by_user_id=created_by_user.id if created_by_user else None,
    )
    db.add(user)
    db.flush()

    starting_balance = DEFAULT_ROLE_POINTS.get(role, 0)

    db.add(UserPoints(user_id=user.id, balance=0))
    db.flush()

    if starting_balance > 0:
        try:
            topup_points(
                db,
                user_id=user.id,
                amount=starting_balance,
                created_by_user_id=created_by_user.id if created_by_user else None,
                note="Initial points assigned during user creation",
            )
        except HTTPException:
            db.rollback()
            raise
    else:
        db.commit()

    db.refresh(user)
    return user


def create_demo_self_registered_user(db: Session, payload: DemoRegisterRequest) -> User:
    existing_user = get_user_by_email(db, payload.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This email already used a demo registration. Please sign in or contact super admin.",
        )

    requested_username = (payload.username or _derive_username_from_email(payload.email)).strip()
    username = _ensure_unique_username(db, requested_username)

    user = User(
        email=payload.email,
        username=username,
        hashed_password=get_password_hash(payload.password),
        role=RoleEnum.demo_user,
        is_active=True,
        created_by_user_id=None,
        demo_expires_at=datetime.utcnow() + timedelta(days=DEMO_TRIAL_DAYS),
    )
    db.add(user)
    db.flush()

    db.add(UserPoints(user_id=user.id, balance=0))
    db.flush()

    _seed_user_permissions(
        db,
        user_id=user.id,
        selected_actions=payload.selected_actions,
        acting_user_id=None,
    )

    topup_points(
        db,
        user_id=user.id,
        amount=DEMO_SELF_REGISTER_POINTS,
        created_by_user_id=None,
        note="Initial demo points assigned during self-registration",
    )

    db.refresh(user)
    return user


def update_user_role(db: Session, user_id: int, new_role: RoleEnum) -> User:
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    user.role = new_role
    db.commit()
    db.refresh(user)
    return user


def disable_user(db: Session, user_id: int) -> User:
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    user.is_active = False
    db.commit()
    db.refresh(user)
    return user


def delete_user(db: Session, user_id: int, current_user: User) -> None:
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if current_user.id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Super user cannot delete their own account",
        )

    db.query(User).filter(User.created_by_user_id == user_id).update(
        {User.created_by_user_id: None},
        synchronize_session=False,
    )

    db.query(UserConversionPermission).filter(
        UserConversionPermission.created_by == user_id
    ).update({UserConversionPermission.created_by: None}, synchronize_session=False)
    db.query(UserConversionPermission).filter(
        UserConversionPermission.updated_by == user_id
    ).update({UserConversionPermission.updated_by: None}, synchronize_session=False)

    db.query(PointsTopup).filter(PointsTopup.created_by_user_id == user_id).update(
        {PointsTopup.created_by_user_id: None},
        synchronize_session=False,
    )

    db.query(PointsTopupRequest).filter(
        PointsTopupRequest.resolved_by_user_id == user_id
    ).update({PointsTopupRequest.resolved_by_user_id: None}, synchronize_session=False)

    db.query(PointsTopupRequest).filter(
        (PointsTopupRequest.user_id == user_id)
        | (PointsTopupRequest.requested_admin_user_id == user_id)
        | (PointsTopupRequest.created_by_user_id == user_id)
    ).delete(synchronize_session=False)

    db.query(PointsTopup).filter(PointsTopup.user_id == user_id).delete(synchronize_session=False)
    db.query(PointsLedger).filter(PointsLedger.user_id == user_id).delete(synchronize_session=False)
    db.query(Conversion).filter(Conversion.owner_user_id == user_id).delete(synchronize_session=False)
    db.query(UserConversionPermission).filter(
        UserConversionPermission.user_id == user_id
    ).delete(synchronize_session=False)
    db.query(RefreshToken).filter(RefreshToken.user_id == user_id).delete(synchronize_session=False)
    db.query(UserPreference).filter(UserPreference.user_id == user_id).delete(synchronize_session=False)
    db.query(UserPoints).filter(UserPoints.user_id == user_id).delete(synchronize_session=False)
    db.delete(user)
    db.commit()


def ensure_default_super_user(db: Session) -> None:
    if db.query(User).count() > 0:
        return

    user = User(
        email=settings.default_admin_email,
        username=None,
        hashed_password=get_password_hash(settings.default_admin_password),
        role=RoleEnum.super_user,
        is_active=True,
    )
    db.add(user)
    db.flush()
    db.add(UserPoints(user_id=user.id, balance=0))
    db.commit()

    print(
        "WARNING: Default super_user created (email: admin@local, password: Admin@12345). "
        "Change this immediately."
    )
