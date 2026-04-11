from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import case, func
from sqlalchemy.orm import Session

from core.deps import get_current_user, require_role
from core.permissions import list_allowed_actions, validate_action
from core.points import POINTS_COST_PER_REQUEST
from db.models import Conversion, RoleEnum, User, UserConversionPermission
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

API_META: dict[str, dict[str, str]] = {
    "pdf_to_docs": {
        "route": "/api/v3/conversions/pdf-to-word",
        "method": "POST",
        "theme": "blue",
        "icon": "description",
        "description": "Convert PDF to Word document",
    },
    "pdf_to_excel": {
        "route": "/api/v3/conversions/pdf-to-excel",
        "method": "POST",
        "theme": "emerald",
        "icon": "table_chart",
        "description": "Convert PDF to Excel spreadsheet",
    },
    "docx_to_pdf": {
        "route": "/api/v3/conversions/docx-to-pdf",
        "method": "POST",
        "theme": "blue",
        "icon": "description",
        "description": "Convert Word to PDF",
    },
    "excel_to_pdf": {
        "route": "/api/v3/conversions/excel-to-pdf",
        "method": "POST",
        "theme": "green",
        "icon": "grid_on",
        "description": "Convert Excel to PDF",
    },
    "image_to_pdf": {
        "route": "/api/v3/conversions/image-to-pdf",
        "method": "POST",
        "theme": "amber",
        "icon": "image",
        "description": "Convert Image to PDF",
    },
    "pdf_page_remove": {
        "route": "/api/v3/conversions/remove-pages-from-pdf",
        "method": "POST",
        "theme": "slate",
        "icon": "delete_sweep",
        "description": "Remove selected pages from PDF",
    },
}


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
    action_rows = list_allowed_actions()
    allowed_actions = {item["action"]: item["label"] for item in action_rows}

    permission_rows = (
        db.query(UserConversionPermission.action, UserConversionPermission.is_allowed)
        .filter(UserConversionPermission.user_id == current_user.id)
        .all()
    )
    permission_map = {row.action: bool(row.is_allowed) for row in permission_rows}

    if current_user.role == RoleEnum.super_user:
        permission_map = {action: True for action in allowed_actions}

    stats_rows = (
        db.query(
            Conversion.action.label("action"),
            func.max(Conversion.updated_at).label("last_used_at"),
            func.count(Conversion.id).label("total_count"),
            func.sum(case((Conversion.status == "success", 1), else_=0)).label("success_count"),
        )
        .filter(
            Conversion.owner_user_id == current_user.id,
            Conversion.action.in_(list(allowed_actions.keys())),
        )
        .group_by(Conversion.action)
        .all()
    )
    stats_map = {row.action: row for row in stats_rows}

    apis: list[MyApiEntry] = []
    for item in action_rows:
        action = item["action"]
        label = item["label"]
        meta = API_META.get(action, {})
        stat = stats_map.get(action)
        total_count = int(stat.total_count) if stat and stat.total_count is not None else 0
        success_count = int(stat.success_count) if stat and stat.success_count is not None else 0
        success_rate = round((success_count / total_count) * 100, 1) if total_count else 0.0

        last_used_at = None
        if stat and stat.last_used_at is not None:
            last_used_at = f"{stat.last_used_at.isoformat()}Z"

        apis.append(
            MyApiEntry(
                action=action,
                label=label,
                route=meta.get("route", ""),
                method=meta.get("method", "POST"),
                allowed=permission_map.get(action, False),
                points=POINTS_COST_PER_REQUEST,
                theme=meta.get("theme", "blue"),
                icon=meta.get("icon", "api"),
                last_used_at=last_used_at,
                success_rate=success_rate,
                description=meta.get("description", label),
            )
        )

    return MyApiListResponse(
        user_id=current_user.id,
        apis=apis,
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
