from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, Query
from sqlalchemy import case, func
from sqlalchemy.orm import Session

from core.deps import get_current_user
from core.permissions import list_allowed_actions
from core.points import POINTS_COST_PER_REQUEST, get_user_balance
from core.timeseries import build_recent_day_keys, earliest_day_bound
from db.models import Conversion, PointsLedger, RoleEnum, User, UserConversionPermission
from db.session import get_db
from models.dashboard import (
    DashboardApiEntry,
    DashboardOverviewResponse,
    DashboardPerformanceDay,
    DashboardRecentHistoryItem,
    DashboardSummary,
    DashboardUserInfo,
    UsageHistoryEndpointEntry,
    UsageHistoryItem,
    UsageHistoryResponse,
    UsageHistorySummary,
    UsageHistoryTrendDay,
    UsagePointsTrendDay,
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
                usage_count=total_count,
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


@router.get("/usage-history", response_model=UsageHistoryResponse)
def get_usage_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    days: int = Query(30, ge=1, le=90),
    limit: int = Query(25, ge=1, le=200),
    offset: int = Query(0, ge=0),
) -> UsageHistoryResponse:
    """The caller's own API + points usage, for the Usage History page.

    Always scoped to ``owner_user_id == current_user.id`` for every role,
    including super_user — this endpoint answers "my usage", never "everyone's".
    (``/conversions/history`` deliberately widens for super_user; do not reuse
    it here.)
    """
    action_labels = {item["action"]: item["label"] for item in list_allowed_actions()}
    day_keys = build_recent_day_keys(days)
    window_start = earliest_day_bound(days)

    mine = Conversion.owner_user_id == current_user.id
    my_ledger = PointsLedger.user_id == current_user.id

    # --- Lifetime totals (not windowed — "all information" about my usage) ---
    totals = (
        db.query(
            func.count(Conversion.id).label("total"),
            func.sum(case((Conversion.status == "success", 1), else_=0)).label("success"),
            func.sum(case((Conversion.status == "failed", 1), else_=0)).label("failed"),
            func.sum(
                case((Conversion.status.in_(["processing", "pending", "queued"]), 1), else_=0)
            ).label("processing"),
            func.coalesce(func.sum(Conversion.points_charged), 0).label("points_charged"),
            func.min(Conversion.created_at).label("first_used_at"),
            func.max(Conversion.updated_at).label("last_used_at"),
        )
        .filter(mine)
        .first()
    )
    total_requests = int(totals.total or 0)
    success_requests = int(totals.success or 0)
    failed_requests = int(totals.failed or 0)
    processing_requests = int(totals.processing or 0)
    success_rate = round((success_requests / total_requests) * 100, 1) if total_requests else 0.0

    points_totals = (
        db.query(
            func.coalesce(
                func.sum(case((PointsLedger.status == "spent", -PointsLedger.amount), else_=0)), 0
            ).label("spent"),
            func.coalesce(
                func.sum(case((PointsLedger.status == "topup", PointsLedger.amount), else_=0)), 0
            ).label("topup"),
            func.coalesce(
                func.sum(case((PointsLedger.status == "refunded", PointsLedger.amount), else_=0)), 0
            ).label("refunded"),
        )
        .filter(my_ledger)
        .first()
    )

    # Average wall-clock duration of completed runs, in milliseconds. Computed in
    # Python from the last 100 successes: the timestamp-diff SQL differs across
    # MySQL/SQLite, and this mirrors how /overview derives avg_latency_ms.
    recent_success_rows = (
        db.query(Conversion.created_at, Conversion.updated_at)
        .filter(mine, Conversion.status == "success")
        .order_by(Conversion.updated_at.desc())
        .limit(100)
        .all()
    )
    durations = [
        (row.updated_at - row.created_at).total_seconds() * 1000
        for row in recent_success_rows
        if row.updated_at and row.created_at
    ]
    avg_duration_ms = round(sum(durations) / len(durations), 1) if durations else None

    # --- Request trend, zero-filled across the window ---
    request_rows = (
        db.query(
            func.date(Conversion.created_at).label("day"),
            func.count(Conversion.id).label("total"),
            func.sum(case((Conversion.status == "success", 1), else_=0)).label("success"),
            func.sum(case((Conversion.status == "failed", 1), else_=0)).label("failed"),
        )
        .filter(mine, Conversion.created_at >= window_start)
        .group_by(func.date(Conversion.created_at))
        .all()
    )
    request_map = {
        str(row.day): {
            "total": int(row.total or 0),
            "success": int(row.success or 0),
            "failed": int(row.failed or 0),
        }
        for row in request_rows
    }
    request_trend = [
        UsageHistoryTrendDay(
            date=day_key,
            total=request_map.get(day_key, {}).get("total", 0),
            success=request_map.get(day_key, {}).get("success", 0),
            failed=request_map.get(day_key, {}).get("failed", 0),
        )
        for day_key in day_keys
    ]

    # --- Points trend, zero-filled across the same window ---
    points_rows = (
        db.query(
            func.date(PointsLedger.created_at).label("day"),
            func.sum(case((PointsLedger.status == "topup", PointsLedger.amount), else_=0)).label("topup"),
            func.sum(case((PointsLedger.status == "spent", -PointsLedger.amount), else_=0)).label("spent"),
            func.sum(case((PointsLedger.status == "refunded", PointsLedger.amount), else_=0)).label("refunded"),
        )
        .filter(my_ledger, PointsLedger.created_at >= window_start)
        .group_by(func.date(PointsLedger.created_at))
        .all()
    )
    points_map = {
        str(row.day): {
            "topup": int(row.topup or 0),
            "spent": int(row.spent or 0),
            "refunded": int(row.refunded or 0),
        }
        for row in points_rows
    }
    points_trend = [
        UsagePointsTrendDay(
            date=day_key,
            topup=points_map.get(day_key, {}).get("topup", 0),
            spent=points_map.get(day_key, {}).get("spent", 0),
            refunded=points_map.get(day_key, {}).get("refunded", 0),
        )
        for day_key in day_keys
    ]

    # --- Per-endpoint breakdown (lifetime) ---
    permission_rows = (
        db.query(UserConversionPermission.action, UserConversionPermission.is_allowed)
        .filter(UserConversionPermission.user_id == current_user.id)
        .all()
    )
    permission_map = {row.action: bool(row.is_allowed) for row in permission_rows}
    if current_user.role == RoleEnum.super_user:
        permission_map = {action: True for action in action_labels}

    endpoint_rows = (
        db.query(
            Conversion.action.label("action"),
            func.count(Conversion.id).label("total"),
            func.sum(case((Conversion.status == "success", 1), else_=0)).label("success"),
            func.sum(case((Conversion.status == "failed", 1), else_=0)).label("failed"),
            func.coalesce(func.sum(Conversion.points_charged), 0).label("points_spent"),
            func.max(Conversion.updated_at).label("last_used_at"),
        )
        .filter(mine)
        .group_by(Conversion.action)
        .all()
    )

    endpoints: list[UsageHistoryEndpointEntry] = []
    for row in endpoint_rows:
        row_total = int(row.total or 0)
        row_success = int(row.success or 0)
        meta = API_META.get(row.action, {})
        endpoints.append(
            UsageHistoryEndpointEntry(
                action=row.action,
                label=action_labels.get(row.action, row.action.replace("_", " ").title()),
                route=meta.get("route", ""),
                method=meta.get("method", "POST"),
                total=row_total,
                success=row_success,
                failed=int(row.failed or 0),
                success_rate=round((row_success / row_total) * 100, 1) if row_total else 0.0,
                points_spent=int(row.points_spent or 0),
                last_used_at=row.last_used_at,
                allowed=permission_map.get(row.action, False),
            )
        )
    endpoints.sort(key=lambda entry: (-entry.total, entry.label))

    # --- Paginated raw history ---
    history_base = db.query(Conversion).filter(mine)
    history_total = history_base.count()
    history_rows = (
        history_base.order_by(Conversion.created_at.desc(), Conversion.id.desc())
        .limit(limit)
        .offset(offset)
        .all()
    )
    items = [
        UsageHistoryItem(
            id=row.id,
            action=row.action,
            label=action_labels.get(row.action, row.action.replace("_", " ").title()),
            status=row.status,
            input_filename=row.input_filename,
            points_charged=int(row.points_charged or 0),
            duration_ms=(
                int((row.updated_at - row.created_at).total_seconds() * 1000)
                if row.updated_at and row.created_at
                else None
            ),
            created_at=row.created_at,
            updated_at=row.updated_at,
        )
        for row in history_rows
    ]

    return UsageHistoryResponse(
        days=days,
        summary=UsageHistorySummary(
            total_requests=total_requests,
            success_requests=success_requests,
            failed_requests=failed_requests,
            processing_requests=processing_requests,
            success_rate=success_rate,
            points_spent=int(points_totals.spent or 0),
            points_topped_up=int(points_totals.topup or 0),
            points_refunded=int(points_totals.refunded or 0),
            points_balance=get_user_balance(db, current_user.id),
            endpoints_used=len(endpoints),
            avg_duration_ms=avg_duration_ms,
            first_used_at=totals.first_used_at,
            last_used_at=totals.last_used_at,
        ),
        request_trend=request_trend,
        points_trend=points_trend,
        endpoints=endpoints,
        total=history_total,
        limit=limit,
        offset=offset,
        items=items,
    )
