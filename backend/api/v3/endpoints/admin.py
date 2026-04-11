from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import case, func
from sqlalchemy.orm import Session

from core.deps import require_role
from core.permissions import list_allowed_actions
from core.points import POINTS_COST_PER_REQUEST, get_user_balance
from db.models import Conversion, PointsLedger, RoleEnum, User, UserConversionPermission
from db.session import get_db
from models.admin import (
    AdminCheckUserApiEntry,
    AdminCheckUserConversionSummary,
    AdminCheckUserPointsSummary,
    AdminCheckUserResponse,
)
from services.users import get_user_by_id

router = APIRouter(prefix="/admin", tags=["admin"])

API_META: dict[str, dict[str, str]] = {
    "pdf_to_docs": {
        "route": "/api/v3/conversions/pdf-to-word",
        "method": "POST",
        "description": "Convert PDF to Word document",
    },
    "pdf_to_excel": {
        "route": "/api/v3/conversions/pdf-to-excel",
        "method": "POST",
        "description": "Convert PDF to Excel spreadsheet",
    },
    "docx_to_pdf": {
        "route": "/api/v3/conversions/docx-to-pdf",
        "method": "POST",
        "description": "Convert Word to PDF",
    },
    "excel_to_pdf": {
        "route": "/api/v3/conversions/excel-to-pdf",
        "method": "POST",
        "description": "Convert Excel to PDF",
    },
    "image_to_pdf": {
        "route": "/api/v3/conversions/image-to-pdf",
        "method": "POST",
        "description": "Convert Image to PDF",
    },
    "remove_background": {
        "route": "/api/v3/conversions/remove-background",
        "method": "POST",
        "description": "Remove image background",
    },
    "pdf_page_remove": {
        "route": "/api/v3/conversions/remove-pages-from-pdf",
        "method": "POST",
        "description": "Remove selected pages from PDF",
    },
}


@router.get("/check-users/{user_id}", response_model=AdminCheckUserResponse)
def check_user_details(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(RoleEnum.super_user, RoleEnum.admin_user)),
) -> AdminCheckUserResponse:
    _ = current_user
    target_user = get_user_by_id(db, user_id)
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    action_rows = list_allowed_actions()

    permission_rows = (
        db.query(UserConversionPermission.action, UserConversionPermission.is_allowed)
        .filter(UserConversionPermission.user_id == target_user.id)
        .all()
    )
    permission_map = {row.action: bool(row.is_allowed) for row in permission_rows}
    if target_user.role == RoleEnum.super_user:
        permission_map = {item["action"]: True for item in action_rows}

    per_action_stats = (
        db.query(
            Conversion.action.label("action"),
            func.max(Conversion.updated_at).label("last_used_at"),
            func.count(Conversion.id).label("total_count"),
            func.sum(case((Conversion.status == "success", 1), else_=0)).label("success_count"),
        )
        .filter(Conversion.owner_user_id == target_user.id)
        .group_by(Conversion.action)
        .all()
    )
    per_action_stats_map = {row.action: row for row in per_action_stats}

    api_permissions: list[AdminCheckUserApiEntry] = []
    for item in action_rows:
        action = item["action"]
        label = item["label"]
        meta = API_META.get(action, {})
        stat = per_action_stats_map.get(action)
        total_count = int(stat.total_count) if stat and stat.total_count is not None else 0
        success_count = int(stat.success_count) if stat and stat.success_count is not None else 0
        success_rate = round((success_count / total_count) * 100, 1) if total_count else 0.0

        api_permissions.append(
            AdminCheckUserApiEntry(
                action=action,
                label=label,
                route=meta.get("route", ""),
                method=meta.get("method", "POST"),
                allowed=permission_map.get(action, False),
                points=POINTS_COST_PER_REQUEST,
                last_used_at=stat.last_used_at if stat else None,
                success_rate=success_rate,
                description=meta.get("description", label),
            )
        )

    active_apis = [entry for entry in api_permissions if entry.allowed]

    points_summary_row = (
        db.query(
            func.sum(case((PointsLedger.status == "topup", PointsLedger.amount), else_=0)).label("total_topup"),
            func.sum(case((PointsLedger.status == "spent", -PointsLedger.amount), else_=0)).label("total_spent"),
            func.sum(case((PointsLedger.status == "refunded", PointsLedger.amount), else_=0)).label("total_refunded"),
            func.max(PointsLedger.created_at).label("last_points_activity_at"),
        )
        .filter(PointsLedger.user_id == target_user.id)
        .first()
    )

    conversion_summary_row = (
        db.query(
            func.count(Conversion.id).label("total"),
            func.sum(case((Conversion.status == "success", 1), else_=0)).label("success"),
            func.sum(case((Conversion.status == "failed", 1), else_=0)).label("failed"),
            func.sum(case((Conversion.status == "processing", 1), else_=0)).label("processing"),
            func.max(Conversion.updated_at).label("last_conversion_at"),
        )
        .filter(Conversion.owner_user_id == target_user.id)
        .first()
    )

    points = AdminCheckUserPointsSummary(
        balance=get_user_balance(db, target_user.id),
        total_topup=int(points_summary_row.total_topup or 0),
        total_spent=int(points_summary_row.total_spent or 0),
        total_refunded=int(points_summary_row.total_refunded or 0),
        last_points_activity_at=points_summary_row.last_points_activity_at,
    )

    conversions = AdminCheckUserConversionSummary(
        total=int(conversion_summary_row.total or 0),
        success=int(conversion_summary_row.success or 0),
        failed=int(conversion_summary_row.failed or 0),
        processing=int(conversion_summary_row.processing or 0),
        last_conversion_at=conversion_summary_row.last_conversion_at,
    )

    last_active_candidates = [
        target_user.last_login,
        points.last_points_activity_at,
        conversions.last_conversion_at,
    ]
    valid_last_active = [item for item in last_active_candidates if isinstance(item, datetime)]
    last_active_at = max(valid_last_active) if valid_last_active else None

    return AdminCheckUserResponse(
        id=target_user.id,
        email=target_user.email,
        username=target_user.username,
        role=target_user.role.value,
        position=target_user.role.value,
        is_active=target_user.is_active,
        created_at=target_user.created_at,
        last_login=target_user.last_login,
        last_active_at=last_active_at,
        points=points,
        conversions=conversions,
        active_apis=active_apis,
        api_permissions=api_permissions,
    )
