from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import case, func
from sqlalchemy.orm import Session

from core.deps import get_current_user
from core.permissions import list_allowed_actions
from core.points import POINTS_COST_PER_REQUEST, get_user_balance
from db.models import Conversion, RoleEnum, User, UserConversionPermission
from db.session import get_db
from models.dashboard import (
    DashboardApiEntry,
    DashboardOverviewResponse,
    DashboardPerformanceDay,
    DashboardRecentHistoryItem,
    DashboardSummary,
    DashboardUserInfo,
)

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

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


@router.get("/overview", response_model=DashboardOverviewResponse)
def get_dashboard_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> DashboardOverviewResponse:
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

    per_action_stats = (
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
    per_action_stats_map = {row.action: row for row in per_action_stats}

    active_apis: list[DashboardApiEntry] = []
    for item in action_rows:
        action = item["action"]
        if not permission_map.get(action, False):
            continue
        label = item["label"]
        meta = API_META.get(action, {})
        stat = per_action_stats_map.get(action)
        total_count = int(stat.total_count) if stat and stat.total_count is not None else 0
        success_count = int(stat.success_count) if stat and stat.success_count is not None else 0
        success_rate = round((success_count / total_count) * 100, 1) if total_count else 0.0
        last_used_at = None
        if stat and stat.last_used_at is not None:
            last_used_at = f"{stat.last_used_at.isoformat()}Z"

        active_apis.append(
            DashboardApiEntry(
                action=action,
                label=label,
                route=meta.get("route", ""),
                method=meta.get("method", "POST"),
                points=POINTS_COST_PER_REQUEST,
                last_used_at=last_used_at,
                success_rate=success_rate,
                description=meta.get("description", label),
            )
        )

    now = datetime.utcnow()
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    thirty_days_ago = now - timedelta(days=30)

    summary_row = (
        db.query(
            func.count(Conversion.id).label("total"),
            func.sum(case((Conversion.status == "success", 1), else_=0)).label("success"),
            func.sum(case((Conversion.status == "failed", 1), else_=0)).label("failed"),
            func.sum(case((Conversion.status == "processing", 1), else_=0)).label("processing"),
        )
        .filter(Conversion.owner_user_id == current_user.id)
        .first()
    )

    monthly_requests = (
        db.query(func.count(Conversion.id))
        .filter(
            Conversion.owner_user_id == current_user.id,
            Conversion.created_at >= month_start,
        )
        .scalar()
        or 0
    )

    recent_success_rows = (
        db.query(Conversion.created_at, Conversion.updated_at)
        .filter(
            Conversion.owner_user_id == current_user.id,
            Conversion.status == "success",
        )
        .order_by(Conversion.updated_at.desc(), Conversion.id.desc())
        .limit(100)
        .all()
    )
    latency_values_ms: list[float] = []
    for row in recent_success_rows:
        if row.created_at and row.updated_at:
            delta = row.updated_at - row.created_at
            latency_values_ms.append(max(delta.total_seconds() * 1000.0, 0.0))
    avg_latency_ms = round(sum(latency_values_ms) / len(latency_values_ms), 1) if latency_values_ms else None

    total_conversions = int(summary_row.total or 0)
    success_conversions = int(summary_row.success or 0)
    failed_conversions = int(summary_row.failed or 0)
    processing_conversions = int(summary_row.processing or 0)
    success_rate = round((success_conversions / total_conversions) * 100, 1) if total_conversions else 0.0

    perf_rows = (
        db.query(
            func.date(Conversion.created_at).label("day"),
            func.count(Conversion.id).label("total"),
            func.sum(case((Conversion.status == "success", 1), else_=0)).label("success"),
            func.sum(case((Conversion.status == "failed", 1), else_=0)).label("failed"),
            func.sum(case((Conversion.status == "processing", 1), else_=0)).label("processing"),
        )
        .filter(
            Conversion.owner_user_id == current_user.id,
            Conversion.created_at >= thirty_days_ago,
        )
        .group_by(func.date(Conversion.created_at))
        .order_by(func.date(Conversion.created_at).asc())
        .all()
    )
    performance_30_days = [
        DashboardPerformanceDay(
            date=str(row.day),
            total=int(row.total or 0),
            success=int(row.success or 0),
            failed=int(row.failed or 0),
            processing=int(row.processing or 0),
        )
        for row in perf_rows
    ]

    recent_rows = (
        db.query(Conversion)
        .filter(Conversion.owner_user_id == current_user.id)
        .order_by(Conversion.created_at.desc(), Conversion.id.desc())
        .limit(50)
        .all()
    )
    recent_history: list[DashboardRecentHistoryItem] = []
    for item in recent_rows:
        meta = API_META.get(item.action, {})
        duration_ms = None
        if item.created_at and item.updated_at:
            duration_ms = max(int((item.updated_at - item.created_at).total_seconds() * 1000), 0)
        download_url = None
        if item.status == "success" and item.output_filename:
            download_url = f"/api/v3/conversions/{item.id}/download"

        recent_history.append(
            DashboardRecentHistoryItem(
                id=item.id,
                action=item.action,
                endpoint=meta.get("route", f"/api/v3/conversions/{item.action.replace('_', '-')}"),
                status=item.status,
                input_filename=item.input_filename,
                points_charged=item.points_charged,
                duration_ms=duration_ms,
                created_at=item.created_at,
                updated_at=item.updated_at,
                download_url=download_url,
            )
        )

    return DashboardOverviewResponse(
        user=DashboardUserInfo(
            id=current_user.id,
            email=current_user.email,
            username=current_user.username,
            role=current_user.role.value,
            is_active=current_user.is_active,
            created_at=current_user.created_at,
        ),
        summary=DashboardSummary(
            monthly_requests=int(monthly_requests),
            remaining_points=get_user_balance(db, current_user.id),
            success_rate=success_rate,
            avg_latency_ms=avg_latency_ms,
            total_conversions=total_conversions,
            success_conversions=success_conversions,
            failed_conversions=failed_conversions,
            processing_conversions=processing_conversions,
            active_api_count=len(active_apis),
        ),
        performance_30_days=performance_30_days,
        active_apis=active_apis,
        recent_history=recent_history,
    )
