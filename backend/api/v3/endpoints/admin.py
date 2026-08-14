from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import case, func, literal
from sqlalchemy.orm import Session, aliased

from core.billing_packages import grant_admin_access
from core.deps import ensure_can_manage_user, require_role
from core.permissions import list_allowed_actions
from core.points import POINTS_COST_PER_REQUEST, get_user_balance, topup_points
from core.timeseries import build_recent_day_keys
from db.models import (
    Conversion,
    PointsLedger,
    PointsTopup,
    PointsTopupRequest,
    RoleEnum,
    User,
    UserConversionPermission,
    UserPoints,
)
from db.session import get_db
from models.admin import (
    AdminCheckUserApiEntry,
    AdminFundingMovement,
    AdminFundingSummaryResponse,
    AdminCheckUserConversionSummary,
    AdminCheckUserPointsSummary,
    AdminCheckUserResponse,
    AdminActiveUserEntry,
    AdminActiveUsersResponse,
    AdminDashboardActivityEntry,
    AdminDashboardPointsTrendDay,
    AdminDashboardQuickStat,
    AdminDashboardRequestTrendDay,
    AdminDashboardSummaryResponse,
    AdminDashboardSystemMetric,
    AdminDashboardTopPointHolder,
    AdminPointGivingHistoryEntry,
    AdminPointGivingHistoryResponse,
    AdminRoleUpdateRequest,
    AdminRoleUpdateResponse,
    AdminTopupRequestEntry,
    AdminTopupRequestListResponse,
)
from services.notifications import notify_users
from services.users import get_user_by_id

router = APIRouter(prefix="/admin", tags=["admin"])


def _ensure_admin_can_handle_topup_request(current_user: User, request: PointsTopupRequest) -> None:
    if current_user.role == RoleEnum.super_user:
        return
    if request.requested_admin_user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not permitted to manage this topup request",
        )


def _build_topup_request_entry(db: Session, request: PointsTopupRequest) -> AdminTopupRequestEntry:
    target_user = db.query(User).filter(User.id == request.user_id).first()
    requested_admin = db.query(User).filter(User.id == request.requested_admin_user_id).first()
    creator_user = db.query(User).filter(User.id == request.created_by_user_id).first()
    resolver_user = (
        db.query(User).filter(User.id == request.resolved_by_user_id).first()
        if request.resolved_by_user_id is not None
        else None
    )

    if not target_user or not requested_admin or not creator_user:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Topup request references missing users",
        )

    return AdminTopupRequestEntry(
        id=request.id,
        user_id=request.user_id,
        user_email=target_user.email,
        user_username=target_user.username,
        requested_admin_user_id=request.requested_admin_user_id,
        requested_admin_email=requested_admin.email,
        requested_admin_username=requested_admin.username,
        amount=request.amount,
        note=request.note,
        status=request.status,
        created_by_user_id=request.created_by_user_id,
        created_by_email=creator_user.email,
        created_by_username=creator_user.username,
        resolved_by_user_id=request.resolved_by_user_id,
        resolved_by_email=resolver_user.email if resolver_user else None,
        resolved_by_username=resolver_user.username if resolver_user else None,
        resolved_at=request.resolved_at,
        created_at=request.created_at,
        updated_at=request.updated_at,
    )

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
    # A super_user sees platform-wide data; an admin_user sees only the
    # activity of users they personally created (User.created_by_user_id) —
    # same rule as list_users() and the points giving-history endpoints below.
    is_admin_scoped = current_user.role == RoleEnum.admin_user

    recent_day_keys = build_recent_day_keys()
    earliest_day = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0) - timedelta(days=29)

    total_points_issued_query = db.query(func.coalesce(func.sum(PointsTopup.amount), 0)).join(
        User, User.id == PointsTopup.user_id
    )
    if is_admin_scoped:
        total_points_issued_query = total_points_issued_query.filter(
            User.created_by_user_id == current_user.id
        )
    total_points_issued = total_points_issued_query.scalar() or 0

    active_users_query = db.query(func.count(User.id)).filter(User.is_active.is_(True))
    if is_admin_scoped:
        active_users_query = active_users_query.filter(User.created_by_user_id == current_user.id)
    active_users = active_users_query.scalar() or 0

    total_api_requests_query = db.query(func.count(Conversion.id)).join(
        User, User.id == Conversion.owner_user_id
    )
    if is_admin_scoped:
        total_api_requests_query = total_api_requests_query.filter(
            User.created_by_user_id == current_user.id
        )
    total_api_requests = total_api_requests_query.scalar() or 0

    flagged_activities_query = (
        db.query(func.count(Conversion.id))
        .join(User, User.id == Conversion.owner_user_id)
        .filter(Conversion.status == "failed")
    )
    if is_admin_scoped:
        flagged_activities_query = flagged_activities_query.filter(
            User.created_by_user_id == current_user.id
        )
    flagged_activities = flagged_activities_query.scalar() or 0

    recent_rows_query = db.query(
        PointsLedger.user_id,
        User.email.label("user_email"),
        User.username.label("user_username"),
        PointsLedger.amount,
        PointsLedger.status,
        PointsLedger.created_at,
    ).join(User, User.id == PointsLedger.user_id)
    if is_admin_scoped:
        recent_rows_query = recent_rows_query.filter(User.created_by_user_id == current_user.id)
    recent_rows = (
        recent_rows_query
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

    success_stats_query = db.query(
        func.count(Conversion.id).label("total"),
        func.sum(case((Conversion.status == "success", 1), else_=0)).label("success"),
        func.sum(
            case(
                (Conversion.status.in_(["processing", "pending", "queued"]), 1),
                else_=0,
            )
        ).label("processing"),
    ).join(User, User.id == Conversion.owner_user_id)
    if is_admin_scoped:
        success_stats_query = success_stats_query.filter(User.created_by_user_id == current_user.id)
    success_stats = success_stats_query.first()
    total_conversions = int(success_stats.total or 0)
    successful_conversions = int(success_stats.success or 0)
    processing_queue = int(success_stats.processing or 0)
    api_success_rate = round((successful_conversions / total_conversions) * 100, 1) if total_conversions else 0.0

    failed_last_day_query = (
        db.query(func.count(Conversion.id))
        .join(User, User.id == Conversion.owner_user_id)
        .filter(
            Conversion.status == "failed",
            Conversion.updated_at >= datetime.utcnow() - timedelta(hours=24),
        )
    )
    if is_admin_scoped:
        failed_last_day_query = failed_last_day_query.filter(User.created_by_user_id == current_user.id)
    failed_last_day = failed_last_day_query.scalar() or 0

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

    request_rows_query = (
        db.query(
            func.date(Conversion.created_at).label("day"),
            func.count(Conversion.id).label("total"),
            func.sum(case((Conversion.status == "success", 1), else_=0)).label("success"),
            func.sum(case((Conversion.status == "failed", 1), else_=0)).label("failed"),
            func.sum(
                case(
                    (Conversion.status.in_(["processing", "pending", "queued"]), 1),
                    else_=0,
                )
            ).label("processing"),
        )
        .join(User, User.id == Conversion.owner_user_id)
        .filter(Conversion.created_at >= earliest_day)
    )
    if is_admin_scoped:
        request_rows_query = request_rows_query.filter(User.created_by_user_id == current_user.id)
    request_rows = (
        request_rows_query
        .group_by(func.date(Conversion.created_at))
        .order_by(func.date(Conversion.created_at).asc())
        .all()
    )
    request_map = {
        str(row.day): {
            "total": int(row.total or 0),
            "success": int(row.success or 0),
            "failed": int(row.failed or 0),
            "processing": int(row.processing or 0),
        }
        for row in request_rows
    }
    request_trend_30_days = [
        AdminDashboardRequestTrendDay(
            date=day_key,
            total=request_map.get(day_key, {}).get("total", 0),
            success=request_map.get(day_key, {}).get("success", 0),
            failed=request_map.get(day_key, {}).get("failed", 0),
            processing=request_map.get(day_key, {}).get("processing", 0),
        )
        for day_key in recent_day_keys
    ]

    points_rows_query = (
        db.query(
            func.date(PointsLedger.created_at).label("day"),
            func.sum(case((PointsLedger.status == "topup", PointsLedger.amount), else_=0)).label("topup"),
            func.sum(case((PointsLedger.status == "spent", -PointsLedger.amount), else_=0)).label("spent"),
            func.sum(case((PointsLedger.status == "refunded", PointsLedger.amount), else_=0)).label("refunded"),
        )
        .join(User, User.id == PointsLedger.user_id)
        .filter(PointsLedger.created_at >= earliest_day)
    )
    if is_admin_scoped:
        points_rows_query = points_rows_query.filter(User.created_by_user_id == current_user.id)
    points_rows = (
        points_rows_query
        .group_by(func.date(PointsLedger.created_at))
        .order_by(func.date(PointsLedger.created_at).asc())
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
    points_activity_30_days = [
        AdminDashboardPointsTrendDay(
            date=day_key,
            topup=points_map.get(day_key, {}).get("topup", 0),
            spent=points_map.get(day_key, {}).get("spent", 0),
            refunded=points_map.get(day_key, {}).get("refunded", 0),
        )
        for day_key in recent_day_keys
    ]

    top_point_holder_rows_query = db.query(
        UserPoints.user_id,
        User.email,
        User.username,
        User.role,
        UserPoints.balance,
    ).join(User, User.id == UserPoints.user_id)
    if is_admin_scoped:
        top_point_holder_rows_query = top_point_holder_rows_query.filter(
            User.created_by_user_id == current_user.id
        )
    top_point_holder_rows = (
        top_point_holder_rows_query
        .order_by(UserPoints.balance.desc(), User.id.asc())
        .limit(6)
        .all()
    )
    top_point_holders = [
        AdminDashboardTopPointHolder(
            user_id=row.user_id,
            email=row.email,
            username=row.username,
            role=row.role.value if hasattr(row.role, "value") else str(row.role),
            balance=int(row.balance or 0),
        )
        for row in top_point_holder_rows
    ]

    return AdminDashboardSummaryResponse(
        quick_stats=quick_stats,
        recent_activity=recent_activity,
        system_status=system_status,
        request_trend_30_days=request_trend_30_days,
        points_activity_30_days=points_activity_30_days,
        top_point_holders=top_point_holders,
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
    if current_user.role == RoleEnum.admin_user:
        if created_by_user_id is not None and created_by_user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin can only view their own point transactions",
            )
        base_query = base_query.filter(PointsTopup.created_by_user_id == current_user.id)
    elif created_by_user_id is not None:
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


@router.get("/points/topup-requests", response_model=AdminTopupRequestListResponse)
def get_topup_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(RoleEnum.super_user, RoleEnum.admin_user)),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    status_filter: str | None = Query(None, alias="status"),
) -> AdminTopupRequestListResponse:
    target_user = aliased(User)
    requested_admin = aliased(User)
    creator_user = aliased(User)
    resolver_user = aliased(User)

    base_query = (
        db.query(
            PointsTopupRequest.id,
            PointsTopupRequest.user_id,
            PointsTopupRequest.requested_admin_user_id,
            PointsTopupRequest.amount,
            PointsTopupRequest.note,
            PointsTopupRequest.status,
            PointsTopupRequest.created_by_user_id,
            PointsTopupRequest.resolved_by_user_id,
            PointsTopupRequest.resolved_at,
            PointsTopupRequest.created_at,
            PointsTopupRequest.updated_at,
            target_user.email.label("user_email"),
            target_user.username.label("user_username"),
            requested_admin.email.label("requested_admin_email"),
            requested_admin.username.label("requested_admin_username"),
            creator_user.email.label("created_by_email"),
            creator_user.username.label("created_by_username"),
            resolver_user.email.label("resolved_by_email"),
            resolver_user.username.label("resolved_by_username"),
        )
        .join(target_user, target_user.id == PointsTopupRequest.user_id)
        .join(requested_admin, requested_admin.id == PointsTopupRequest.requested_admin_user_id)
        .join(creator_user, creator_user.id == PointsTopupRequest.created_by_user_id)
        .outerjoin(resolver_user, resolver_user.id == PointsTopupRequest.resolved_by_user_id)
    )

    if current_user.role == RoleEnum.admin_user:
        base_query = base_query.filter(PointsTopupRequest.requested_admin_user_id == current_user.id)
    if status_filter:
        base_query = base_query.filter(PointsTopupRequest.status == status_filter)

    total = base_query.count()
    rows = (
        base_query
        .order_by(PointsTopupRequest.created_at.desc(), PointsTopupRequest.id.desc())
        .limit(limit)
        .offset(offset)
        .all()
    )

    items = [
        AdminTopupRequestEntry(
            id=row.id,
            user_id=row.user_id,
            user_email=row.user_email,
            user_username=row.user_username,
            requested_admin_user_id=row.requested_admin_user_id,
            requested_admin_email=row.requested_admin_email,
            requested_admin_username=row.requested_admin_username,
            amount=row.amount,
            note=row.note,
            status=row.status,
            created_by_user_id=row.created_by_user_id,
            created_by_email=row.created_by_email,
            created_by_username=row.created_by_username,
            resolved_by_user_id=row.resolved_by_user_id,
            resolved_by_email=row.resolved_by_email,
            resolved_by_username=row.resolved_by_username,
            resolved_at=row.resolved_at,
            created_at=row.created_at,
            updated_at=row.updated_at,
        )
        for row in rows
    ]

    return AdminTopupRequestListResponse(
        total=total,
        limit=limit,
        offset=offset,
        items=items,
    )


@router.get("/points/funding-summary", response_model=AdminFundingSummaryResponse)
def get_funding_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(RoleEnum.super_user, RoleEnum.admin_user)),
    limit: int = Query(25, ge=1, le=200),
    offset: int = Query(0, ge=0),
) -> AdminFundingSummaryResponse:
    """The caller's own funding position: what came in, what went out, what's left.

    Points are pre-funded — an admin can only distribute what a super user has
    already transferred to them — so this is the view that makes the chain legible.
    """
    balance = get_user_balance(db, current_user.id)

    # Received: every top-up credited to this account, split out by whether a
    # super user funded it. Uses PointsTopup.created_by_user_id so rows written
    # before source metadata existed still resolve correctly.
    funder = aliased(User)
    received_rows = (
        db.query(
            func.coalesce(func.sum(PointsTopup.amount), 0).label("total"),
            func.coalesce(
                func.sum(
                    case((funder.role == RoleEnum.super_user, PointsTopup.amount), else_=0)
                ),
                0,
            ).label("from_super"),
        )
        .outerjoin(funder, funder.id == PointsTopup.created_by_user_id)
        .filter(PointsTopup.user_id == current_user.id)
        .first()
    )
    received_total = int(received_rows.total or 0)
    received_from_super = int(received_rows.from_super or 0)

    # Transferred out: the debit leg written by core.points.topup_points.
    transferred_to_users = int(
        db.query(func.coalesce(func.sum(-PointsLedger.amount), 0))
        .filter(
            PointsLedger.user_id == current_user.id,
            PointsLedger.action == "admin_points_transfer",
        )
        .scalar()
        or 0
    )

    # What is already promised but not yet paid out of this balance.
    pending_request_points = int(
        db.query(func.coalesce(func.sum(PointsTopupRequest.amount), 0))
        .filter(
            PointsTopupRequest.requested_admin_user_id == current_user.id,
            PointsTopupRequest.status == "pending",
        )
        .scalar()
        or 0
    )

    # --- Combined movement history (both legs), newest first ---
    counterparty = aliased(User)

    incoming = (
        db.query(
            PointsTopup.id.label("id"),
            literal("in").label("direction"),
            PointsTopup.amount.label("amount"),
            counterparty.id.label("cp_id"),
            counterparty.email.label("cp_email"),
            counterparty.username.label("cp_username"),
            counterparty.role.label("cp_role"),
            PointsTopup.note.label("note"),
            PointsTopup.created_at.label("created_at"),
        )
        .outerjoin(counterparty, counterparty.id == PointsTopup.created_by_user_id)
        .filter(PointsTopup.user_id == current_user.id)
    )

    outgoing = (
        db.query(
            PointsLedger.id.label("id"),
            literal("out").label("direction"),
            (-PointsLedger.amount).label("amount"),
            counterparty.id.label("cp_id"),
            counterparty.email.label("cp_email"),
            counterparty.username.label("cp_username"),
            counterparty.role.label("cp_role"),
            literal(None).label("note"),
            PointsLedger.created_at.label("created_at"),
        )
        # SQLAlchemy's typed JSON accessor, not a raw json_extract() — it emits
        # the right expression per dialect (MySQL in production, SQLite in tests)
        # and casts to an integer so the id comparison is apples-to-apples.
        .outerjoin(
            counterparty,
            counterparty.id == PointsLedger.meta_json["target_user_id"].as_integer(),
        )
        .filter(
            PointsLedger.user_id == current_user.id,
            PointsLedger.action == "admin_points_transfer",
        )
    )

    combined = incoming.union_all(outgoing).subquery()
    total = db.query(func.count()).select_from(combined).scalar() or 0
    rows = (
        db.query(combined)
        .order_by(combined.c.created_at.desc())
        .limit(limit)
        .offset(offset)
        .all()
    )

    items = [
        AdminFundingMovement(
            id=int(row.id),
            direction=str(row.direction),
            amount=int(row.amount or 0),
            counterparty_id=row.cp_id,
            counterparty_email=row.cp_email,
            counterparty_username=row.cp_username,
            counterparty_role=(
                row.cp_role.value if hasattr(row.cp_role, "value") else row.cp_role
            ),
            note=row.note,
            created_at=row.created_at,
        )
        for row in rows
    ]

    return AdminFundingSummaryResponse(
        balance=balance,
        received_from_super=received_from_super,
        received_total=received_total,
        transferred_to_users=transferred_to_users,
        pending_request_points=pending_request_points,
        # Only a super user can bring new points into the system, by crediting
        # their own balance.
        can_issue=current_user.role == RoleEnum.super_user,
        total=int(total),
        limit=limit,
        offset=offset,
        items=items,
    )


@router.post("/points/topup-requests/{request_id}/approve", response_model=AdminTopupRequestEntry)
def approve_topup_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(RoleEnum.super_user, RoleEnum.admin_user)),
) -> AdminTopupRequestEntry:
    request = db.query(PointsTopupRequest).filter(PointsTopupRequest.id == request_id).first()
    if not request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Topup request not found")
    _ensure_admin_can_handle_topup_request(current_user, request)
    if request.status != "pending":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Topup request is not pending")

    topup_points(
        db,
        user_id=request.user_id,
        amount=request.amount,
        created_by_user_id=current_user.id,
        note=request.note,
    )

    # Medium/large packages include admin access. The promotion happens only
    # here — on an explicit approval by an admin who can see the package on the
    # request — never at request time, so buying alone never escalates a role.
    if request.grants_admin_access:
        buyer = get_user_by_id(db, request.user_id)
        if buyer:
            grant_admin_access(buyer)

    request.status = "approved"
    request.resolved_by_user_id = current_user.id
    request.resolved_at = datetime.utcnow()
    db.commit()
    db.refresh(request)
    return _build_topup_request_entry(db, request)


@router.post("/points/topup-requests/{request_id}/reject", response_model=AdminTopupRequestEntry)
def reject_topup_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(RoleEnum.super_user, RoleEnum.admin_user)),
) -> AdminTopupRequestEntry:
    request = db.query(PointsTopupRequest).filter(PointsTopupRequest.id == request_id).first()
    if not request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Topup request not found")
    _ensure_admin_can_handle_topup_request(current_user, request)
    if request.status != "pending":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Topup request is not pending")

    request.status = "rejected"
    request.resolved_by_user_id = current_user.id
    request.resolved_at = datetime.utcnow()

    # A decline is the one outcome that credits nothing, so it has no
    # topup_points call to piggyback on — notify explicitly, in the same
    # transaction as the status change.
    decline_note = f' Note: "{request.note}"' if request.note else ""
    notify_users(
        db,
        user_ids=[request.user_id],
        title="Top-up request declined",
        message=(
            f"Your request for {request.amount:,} points was declined by "
            f"{current_user.username or current_user.email}.{decline_note}"
        ),
        category="warning",
        sender_user_id=current_user.id,
    )

    db.commit()
    db.refresh(request)
    return _build_topup_request_entry(db, request)


@router.get("/check-users/{user_id}", response_model=AdminCheckUserResponse)
def check_user_details(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(RoleEnum.super_user, RoleEnum.admin_user)),
) -> AdminCheckUserResponse:
    target_user = get_user_by_id(db, user_id)
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if (
        current_user.role == RoleEnum.admin_user
        and target_user.created_by_user_id != current_user.id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not permitted to view this user",
        )

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


# Roles an admin_user is allowed to hand out. super_user is unrestricted.
ADMIN_ASSIGNABLE_ROLES = {RoleEnum.general_user, RoleEnum.demo_user}


@router.patch("/users/{user_id}/role", response_model=AdminRoleUpdateResponse)
def update_user_role_v3(
    user_id: int,
    payload: AdminRoleUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(RoleEnum.super_user, RoleEnum.admin_user)),
) -> AdminRoleUpdateResponse:
    """Change a user's role.

    Unlike ``PATCH /api/v2/users/{id}/role`` (super_user only), an admin_user
    may use this to move their own general/demo users between those two roles
    — the demo-to-general promotion the admin console needs. Admins still
    cannot create or touch admin/super accounts.
    """
    try:
        new_role = RoleEnum(payload.role)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role '{payload.role}'",
        )

    target_user = get_user_by_id(db, user_id)
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if target_user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot change your own role",
        )

    ensure_can_manage_user(current_user, target_user)

    if current_user.role == RoleEnum.admin_user and new_role not in ADMIN_ASSIGNABLE_ROLES:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admins can only assign the General User or Demo User role",
        )

    previous_role = target_user.role.value
    if new_role != target_user.role:
        target_user.role = new_role
        # A demo account's expiry is meaningless once it is a real user, and a
        # stale timestamp would keep tripping the demo-expiry check.
        if new_role != RoleEnum.demo_user:
            target_user.demo_expires_at = None
        db.commit()
        db.refresh(target_user)

    return AdminRoleUpdateResponse(
        id=target_user.id,
        email=target_user.email,
        username=target_user.username,
        role=target_user.role.value,
        previous_role=previous_role,
    )
