from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import case, func
from sqlalchemy.orm import Session, aliased

from core.deps import require_role
from core.permissions import list_allowed_actions
from core.points import POINTS_COST_PER_REQUEST, get_user_balance
from db.models import Conversion, PointsLedger, PointsTopup, RoleEnum, User, UserConversionPermission, UserPoints
from db.session import get_db
from models.admin import (
    AdminCheckUserApiEntry,
    AdminCheckUserConversionSummary,
    AdminCheckUserPointsSummary,
    AdminCheckUserResponse,
    AdminActiveUserEntry,
    AdminActiveUsersResponse,
    AdminDashboardActivityEntry,
    AdminDashboardQuickStat,
    AdminDashboardSummaryResponse,
    AdminDashboardSystemMetric,
    AdminPointGivingHistoryEntry,
    AdminPointGivingHistoryResponse,
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


@router.get("/dashboard-summary", response_model=AdminDashboardSummaryResponse)
def get_admin_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(RoleEnum.super_user, RoleEnum.admin_user)),
) -> AdminDashboardSummaryResponse:
    _ = current_user

    total_points_issued = (
        db.query(func.coalesce(func.sum(PointsTopup.amount), 0))
        .scalar()
        or 0
    )
    active_users = (
        db.query(func.count(User.id))
        .filter(User.is_active.is_(True))
        .scalar()
        or 0
    )
    total_api_requests = db.query(func.count(Conversion.id)).scalar() or 0
    flagged_activities = (
        db.query(func.count(Conversion.id))
        .filter(Conversion.status == "failed")
        .scalar()
        or 0
    )

    recent_rows = (
        db.query(
            PointsLedger.user_id,
            User.email.label("user_email"),
            User.username.label("user_username"),
            PointsLedger.amount,
            PointsLedger.status,
            PointsLedger.created_at,
        )
        .join(User, User.id == PointsLedger.user_id)
        .order_by(PointsLedger.created_at.desc(), PointsLedger.id.desc())
        .limit(8)
        .all()
    )

    action_labels = {
        "topup": "Top Up",
        "spent": "Conversion Charge",
        "refunded": "Refund",
    }
    recent_activity = [
        AdminDashboardActivityEntry(
            user_id=row.user_id,
            user_email=row.user_email,
            user_username=row.user_username,
            points_change=int(row.amount or 0),
            action=action_labels.get(row.status, str(row.status).replace("_", " ").title()),
            occurred_at=row.created_at,
        )
        for row in recent_rows
    ]

    success_stats = (
        db.query(
            func.count(Conversion.id).label("total"),
            func.sum(case((Conversion.status == "success", 1), else_=0)).label("success"),
            func.sum(
                case(
                    (Conversion.status.in_(["processing", "pending", "queued"]), 1),
                    else_=0,
                )
            ).label("processing"),
        )
        .first()
    )
    total_conversions = int(success_stats.total or 0)
    successful_conversions = int(success_stats.success or 0)
    processing_queue = int(success_stats.processing or 0)
    api_success_rate = round((successful_conversions / total_conversions) * 100, 1) if total_conversions else 0.0

    failed_last_day = (
        db.query(func.count(Conversion.id))
        .filter(
            Conversion.status == "failed",
            Conversion.updated_at >= datetime.utcnow() - timedelta(hours=24),
        )
        .scalar()
        or 0
    )

    quick_stats = [
        AdminDashboardQuickStat(label="Total Points Issued", value=int(total_points_issued), icon="toll"),
        AdminDashboardQuickStat(label="Active Users", value=int(active_users), icon="group"),
        AdminDashboardQuickStat(label="API Requests", value=int(total_api_requests), icon="api"),
        AdminDashboardQuickStat(label="Flagged Activities", value=int(flagged_activities), icon="report_problem"),
    ]

    system_status = [
        AdminDashboardSystemMetric(
            label="API Success Rate",
            value=f"{api_success_rate:.1f}%",
            tone="success" if api_success_rate >= 95 else "warning",
        ),
        AdminDashboardSystemMetric(
            label="Processing Queue",
            value=str(processing_queue),
            tone="warning" if processing_queue > 0 else "success",
        ),
        AdminDashboardSystemMetric(
            label="Failed Last 24h",
            value=str(int(failed_last_day)),
            tone="danger" if failed_last_day > 0 else "success",
        ),
    ]

    return AdminDashboardSummaryResponse(
        quick_stats=quick_stats,
        recent_activity=recent_activity,
        system_status=system_status,
    )


@router.get("/active-users", response_model=AdminActiveUsersResponse)
def get_active_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(RoleEnum.super_user, RoleEnum.admin_user)),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
) -> AdminActiveUsersResponse:
    _ = current_user

    total = db.query(User).filter(User.is_active.is_(True)).count()
    users = (
        db.query(User)
        .filter(User.is_active.is_(True))
        .order_by(User.created_at.desc(), User.id.desc())
        .limit(limit)
        .offset(offset)
        .all()
    )

    if not users:
        return AdminActiveUsersResponse(total=total, limit=limit, offset=offset, items=[])

    user_ids = [user.id for user in users]

    balance_rows = (
        db.query(UserPoints.user_id, UserPoints.balance)
        .filter(UserPoints.user_id.in_(user_ids))
        .all()
    )
    balance_map = {row.user_id: int(row.balance or 0) for row in balance_rows}

    points_rows = (
        db.query(
            PointsLedger.user_id.label("user_id"),
            func.max(PointsLedger.created_at).label("last_points_activity_at"),
        )
        .filter(PointsLedger.user_id.in_(user_ids))
        .group_by(PointsLedger.user_id)
        .all()
    )
    points_map = {row.user_id: row.last_points_activity_at for row in points_rows}

    conversion_rows = (
        db.query(
            Conversion.owner_user_id.label("user_id"),
            func.max(Conversion.updated_at).label("last_conversion_at"),
        )
        .filter(Conversion.owner_user_id.in_(user_ids))
        .group_by(Conversion.owner_user_id)
        .all()
    )
    conversion_map = {row.user_id: row.last_conversion_at for row in conversion_rows}

    items: list[AdminActiveUserEntry] = []
    for user in users:
        last_active_candidates = [
            user.last_login,
            points_map.get(user.id),
            conversion_map.get(user.id),
        ]
        valid_last_active = [item for item in last_active_candidates if isinstance(item, datetime)]
        last_active_at = max(valid_last_active) if valid_last_active else None

        items.append(
            AdminActiveUserEntry(
                id=user.id,
                email=user.email,
                username=user.username,
                role=user.role.value,
                is_active=bool(user.is_active),
                created_at=user.created_at,
                last_login=user.last_login,
                last_active_at=last_active_at,
                balance=balance_map.get(user.id, 0),
            )
        )

    return AdminActiveUsersResponse(
        total=total,
        limit=limit,
        offset=offset,
        items=items,
    )


@router.get("/points/giving-history", response_model=AdminPointGivingHistoryResponse)
def get_points_giving_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(RoleEnum.super_user, RoleEnum.admin_user)),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    user_id: int | None = Query(None, ge=1),
    created_by_user_id: int | None = Query(None, ge=1),
) -> AdminPointGivingHistoryResponse:
    _ = current_user

    target_user = aliased(User)
    creator_user = aliased(User)

    base_query = (
        db.query(
            PointsTopup.id,
            PointsTopup.user_id,
            PointsTopup.amount,
            PointsTopup.note,
            PointsTopup.created_at,
            PointsTopup.created_by_user_id,
            target_user.email.label("user_email"),
            target_user.username.label("user_username"),
            creator_user.email.label("created_by_email"),
            creator_user.username.label("created_by_username"),
        )
        .join(target_user, target_user.id == PointsTopup.user_id)
        .outerjoin(creator_user, creator_user.id == PointsTopup.created_by_user_id)
    )

    if user_id is not None:
        base_query = base_query.filter(PointsTopup.user_id == user_id)
    if created_by_user_id is not None:
        base_query = base_query.filter(PointsTopup.created_by_user_id == created_by_user_id)

    total = base_query.count()
    rows = (
        base_query
        .order_by(PointsTopup.created_at.desc(), PointsTopup.id.desc())
        .limit(limit)
        .offset(offset)
        .all()
    )

    items = [
        AdminPointGivingHistoryEntry(
            id=row.id,
            user_id=row.user_id,
            user_email=row.user_email,
            user_username=row.user_username,
            amount=row.amount,
            note=row.note,
            created_at=row.created_at,
            created_by_user_id=row.created_by_user_id,
            created_by_email=row.created_by_email,
            created_by_username=row.created_by_username,
        )
        for row in rows
    ]

    return AdminPointGivingHistoryResponse(
        total=total,
        limit=limit,
        offset=offset,
        items=items,
    )


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
