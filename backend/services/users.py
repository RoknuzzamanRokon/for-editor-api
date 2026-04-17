from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from core.config import settings
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
from models.auth import UserCreate


def get_user_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == email).first()


def get_user_by_id(db: Session, user_id: int) -> User | None:
    return db.query(User).filter(User.id == user_id).first()


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
