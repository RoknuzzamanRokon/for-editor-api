from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from core.deps import require_role
from db.models import RoleEnum, User
from db.session import get_db
from models.auth import (
    AdminResetPasswordRequest,
    AdminResetPasswordResponse,
    UserCreate,
    UserDeleteResponse,
    UserDisableResponse,
    UserOut,
    UserRoleUpdate,
)
from services import users as user_service

router = APIRouter(prefix="/users", tags=["users"])


@router.post("", response_model=UserOut)
def create_user(
    payload: UserCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(RoleEnum.super_user, RoleEnum.admin_user)),
) -> UserOut:
    return user_service.create_user(db, payload, created_by_user=current_user)


@router.get("", response_model=list[UserOut])
def list_users(
    db: Session = Depends(get_db),
    current_user=Depends(require_role(RoleEnum.super_user, RoleEnum.admin_user)),
) -> list[UserOut]:
    return user_service.list_users(db, current_user)


@router.patch("/{user_id}/role", response_model=UserOut)
def update_user_role(
    user_id: int,
    payload: UserRoleUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(RoleEnum.super_user)),
) -> UserOut:
    return user_service.update_user_role(db, user_id, payload.role)


@router.patch("/{user_id}/disable", response_model=UserDisableResponse)
def disable_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(RoleEnum.super_user, RoleEnum.admin_user)),
) -> UserDisableResponse:
    return user_service.disable_user(db, user_id)


@router.delete("/{user_id}", response_model=UserDeleteResponse)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(RoleEnum.super_user)),
) -> UserDeleteResponse:
    user_service.delete_user(db, user_id, current_user)
    return UserDeleteResponse(id=user_id, message="User deleted successfully")


@router.patch("/{user_id}/reset-password", response_model=AdminResetPasswordResponse)
def reset_user_password(
    user_id: int,
    payload: AdminResetPasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(RoleEnum.super_user)),
) -> AdminResetPasswordResponse:
    user_service.reset_user_password(db, user_id, payload.new_password)
    return AdminResetPasswordResponse(id=user_id, message="Password reset successfully")
