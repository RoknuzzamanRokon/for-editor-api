from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from core.deps import get_current_user, require_role
from core.permissions import list_allowed_actions, validate_action
from db.models import RoleEnum, User, UserConversionPermission
from db.session import get_db
from models.permissions import (
    MyApiEntry,
    MyApiListResponse,
    PermissionListResponse,
    PermissionUpdateRequest,
    PermissionEntry,
    PermissionPatchRequest,
)
from services.users import get_user_by_id

router = APIRouter(prefix="/permissions", tags=["permissions"])


def _ensure_target_allowed(current_user: User, target_user: User) -> None:
    if target_user.role == RoleEnum.super_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot modify super_user permissions")

    if current_user.role == RoleEnum.admin_user:
        if target_user.role not in {RoleEnum.general_user, RoleEnum.demo_user}:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")


@router.get("/actions")
def get_actions(current_user: User = Depends(get_current_user)) -> list[dict[str, str]]:
    return list_allowed_actions()


@router.get("/my-api", response_model=MyApiListResponse)
def get_my_active_apis(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> MyApiListResponse:
    allowed_actions = {item["action"]: item["label"] for item in list_allowed_actions()}

    if current_user.role == RoleEnum.super_user:
        return MyApiListResponse(
            user_id=current_user.id,
            apis=[
                MyApiEntry(action=action, label=label)
                for action, label in sorted(allowed_actions.items(), key=lambda pair: pair[0])
            ],
        )

    entries = (
        db.query(UserConversionPermission)
        .filter(
            UserConversionPermission.user_id == current_user.id,
            UserConversionPermission.is_allowed.is_(True),
        )
        .order_by(UserConversionPermission.action.asc())
        .all()
    )

    return MyApiListResponse(
        user_id=current_user.id,
        apis=[
            MyApiEntry(action=entry.action, label=allowed_actions.get(entry.action, entry.action))
            for entry in entries
        ],
    )


@router.get("/users/{user_id}/permissions", response_model=PermissionListResponse)
def get_user_permissions(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(RoleEnum.super_user, RoleEnum.admin_user)),
) -> PermissionListResponse:
    target_user = get_user_by_id(db, user_id)
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    _ensure_target_allowed(current_user, target_user)

    entries = (
        db.query(UserConversionPermission)
        .filter(UserConversionPermission.user_id == user_id)
        .order_by(UserConversionPermission.action.asc())
        .all()
    )
    return PermissionListResponse(
        user_id=user_id,
        permissions=[PermissionEntry.model_validate(entry) for entry in entries],
    )


@router.put("/users/{user_id}/permissions", response_model=PermissionListResponse)
def upsert_user_permissions(
    user_id: int,
    payload: PermissionUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(RoleEnum.super_user, RoleEnum.admin_user)),
) -> PermissionListResponse:
    target_user = get_user_by_id(db, user_id)
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    _ensure_target_allowed(current_user, target_user)

    for item in payload.permissions:
        validate_action(item.action)
        existing = (
            db.query(UserConversionPermission)
            .filter(
                UserConversionPermission.user_id == user_id,
                UserConversionPermission.action == item.action,
            )
            .first()
        )
        if existing:
            existing.is_allowed = item.is_allowed
            existing.updated_by = current_user.id
        else:
            db.add(
                UserConversionPermission(
                    user_id=user_id,
                    action=item.action,
                    is_allowed=item.is_allowed,
                    created_by=current_user.id,
                    updated_by=current_user.id,
                )
            )
    db.commit()

    entries = (
        db.query(UserConversionPermission)
        .filter(UserConversionPermission.user_id == user_id)
        .order_by(UserConversionPermission.action.asc())
        .all()
    )
    return PermissionListResponse(
        user_id=user_id,
        permissions=[PermissionEntry.model_validate(entry) for entry in entries],
    )


@router.patch("/users/{user_id}/permissions/{action}", response_model=PermissionListResponse)
def set_user_permission(
    user_id: int,
    action: str,
    payload: PermissionPatchRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(RoleEnum.super_user, RoleEnum.admin_user)),
) -> PermissionListResponse:
    target_user = get_user_by_id(db, user_id)
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    _ensure_target_allowed(current_user, target_user)
    validate_action(action)

    existing = (
        db.query(UserConversionPermission)
        .filter(
            UserConversionPermission.user_id == user_id,
            UserConversionPermission.action == action,
        )
        .first()
    )
    if existing:
        existing.is_allowed = payload.is_allowed
        existing.updated_by = current_user.id
    else:
        db.add(
            UserConversionPermission(
                user_id=user_id,
                action=action,
                is_allowed=payload.is_allowed,
                created_by=current_user.id,
                updated_by=current_user.id,
            )
        )
    db.commit()

    entries = (
        db.query(UserConversionPermission)
        .filter(UserConversionPermission.user_id == user_id)
        .order_by(UserConversionPermission.action.asc())
        .all()
    )
    return PermissionListResponse(
        user_id=user_id,
        permissions=[PermissionEntry.model_validate(entry) for entry in entries],
    )
