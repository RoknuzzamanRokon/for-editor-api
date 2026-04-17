from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from core.config import settings
from core.points import DEFAULT_ROLE_POINTS, topup_points
from core.security import get_password_hash
from db.models import RoleEnum, User, UserPoints
from models.auth import UserCreate


def get_user_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == email).first()


def get_user_by_id(db: Session, user_id: int) -> User | None:
    return db.query(User).filter(User.id == user_id).first()


def list_users(db: Session) -> list[User]:
    return db.query(User).order_by(User.id.asc()).all()


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
