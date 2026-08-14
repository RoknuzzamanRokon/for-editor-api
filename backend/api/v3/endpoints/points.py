from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import case, func
from sqlalchemy.orm import Session

from core.billing_packages import (
    MIN_TOPUP_CENTS,
    MIN_TOPUP_POINTS,
    list_packages,
    resolve_package,
    resolve_request_target,
)
from core.deps import get_current_user, require_role
from core.points import POINTS_COST_PER_REQUEST, get_user_balance, topup_points
from db.models import PointsLedger, PointsTopupRequest as PointsTopupRequestModel, RoleEnum, User
from db.session import get_db
from models.points import (
    MyPointResponse,
    PointsActivitySummaryDay,
    PointsActivitySummaryResponse,
    PointsBalanceResponse,
    PointsLedgerList,
    PointsLedgerEntry,
    PointsTopupCreateRequest,
    PointsTopupRequest,
    PointsTopupRequestEntry,
    PointsTopupRequestList,
    PointsTopupResponse,
    TopupPackage,
    TopupPackagesResponse,
    TopupTarget,
)
from services.users import get_user_by_id

router = APIRouter(prefix="/points", tags=["points"])


def _ensure_admin_can_manage_user(current_user: User, target_user: User) -> None:
    if (
        current_user.role == RoleEnum.admin_user
        and target_user.created_by_user_id != current_user.id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin cannot manage points for this user",
        )


@router.get("/balance", response_model=PointsBalanceResponse)
def get_balance(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> PointsBalanceResponse:
    return PointsBalanceResponse(balance=get_user_balance(db, current_user.id))


@router.get("/ledger", response_model=PointsLedgerList)
def get_ledger(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
) -> PointsLedgerList:
    entries = (
        db.query(PointsLedger)
        .filter(PointsLedger.user_id == current_user.id)
        .order_by(PointsLedger.created_at.desc(), PointsLedger.id.desc())
        .limit(limit)
        .offset(offset)
        .all()
    )
    return PointsLedgerList(
        items=[PointsLedgerEntry.model_validate(entry) for entry in entries],
        limit=limit,
        offset=offset,
    )


@router.post("/topup", response_model=PointsTopupResponse, status_code=status.HTTP_200_OK)
def topup(
    payload: PointsTopupRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(RoleEnum.super_user, RoleEnum.admin_user)),
) -> PointsTopupResponse:
    target_user = get_user_by_id(db, payload.user_id)
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    _ensure_admin_can_manage_user(current_user, target_user)

    expires_at = None
    if payload.expiry_days:
        expires_at = datetime.utcnow() + timedelta(days=payload.expiry_days)

    balance = topup_points(
        db,
        user_id=payload.user_id,
        amount=payload.amount,
        created_by_user_id=current_user.id,
        note=payload.note,
        expires_at=expires_at,
    )
    return PointsTopupResponse(user_id=payload.user_id, balance=balance)


@router.get("/topup-packages", response_model=TopupPackagesResponse)
def get_topup_packages(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TopupPackagesResponse:
    """The package catalogue plus who this caller's request would be routed to."""
    target = resolve_request_target(db, current_user)
    routing = "creator" if target.id == current_user.created_by_user_id else "super_user"

    return TopupPackagesResponse(
        min_price_cents=MIN_TOPUP_CENTS,
        min_points=MIN_TOPUP_POINTS,
        packages=[TopupPackage(**item) for item in list_packages()],
        target=TopupTarget(
            id=target.id,
            email=target.email,
            username=target.username,
            role=target.role.value if hasattr(target.role, "value") else str(target.role),
            routing=routing,
        ),
    )


@router.post("/topup-requests", response_model=PointsTopupRequestEntry, status_code=status.HTTP_201_CREATED)
def create_topup_request(
    payload: PointsTopupCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> PointsTopupRequestEntry:
    target_user = get_user_by_id(db, payload.user_id)
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if current_user.role not in {RoleEnum.admin_user, RoleEnum.super_user} and payload.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Users can only request topups for their own account",
        )

    # Commercial terms come from the catalogue, never from the client — a request
    # body can pick a package but can't invent its price or its point value.
    terms = resolve_package(payload.package_key, payload.price_cents)

    # Routing is resolved from who created the account. An explicit target is
    # honoured only for admins/super users, and still has to be a valid fulfiller.
    if payload.requested_admin_user_id is not None:
        if current_user.role not in {RoleEnum.admin_user, RoleEnum.super_user}:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Top-up requests are routed automatically; you cannot choose the recipient",
            )
        requested_admin = get_user_by_id(db, payload.requested_admin_user_id)
        if not requested_admin:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Requested admin not found")
        if requested_admin.role not in {RoleEnum.admin_user, RoleEnum.super_user}:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Requested user must be an admin or super user",
            )
        if (
            requested_admin.role == RoleEnum.admin_user
            and target_user.created_by_user_id != requested_admin.id
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Selected admin is not allowed to manage this user",
            )
    else:
        requested_admin = resolve_request_target(db, target_user)

    request = PointsTopupRequestModel(
        user_id=payload.user_id,
        requested_admin_user_id=requested_admin.id,
        amount=terms["points"],
        package_key=terms["package_key"],
        price_cents=terms["price_cents"],
        grants_admin_access=terms["grants_admin_access"],
        note=payload.note,
        status="pending",
        created_by_user_id=current_user.id,
    )
    db.add(request)
    db.commit()
    db.refresh(request)
    return PointsTopupRequestEntry.model_validate(request)


@router.get("/topup-requests/mine", response_model=PointsTopupRequestList)
def get_my_topup_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
) -> PointsTopupRequestList:
    base_query = db.query(PointsTopupRequestModel).filter(
        PointsTopupRequestModel.created_by_user_id == current_user.id
    )
    total = base_query.count()
    items = (
        base_query
        .order_by(PointsTopupRequestModel.created_at.desc(), PointsTopupRequestModel.id.desc())
        .limit(limit)
        .offset(offset)
        .all()
    )
    return PointsTopupRequestList(
        items=[PointsTopupRequestEntry.model_validate(item) for item in items],
        total=total,
        limit=limit,
        offset=offset,
    )


@router.post("/topup-cancel/request/{request_id}", response_model=PointsTopupRequestEntry)
def cancel_my_topup_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> PointsTopupRequestEntry:
    request = (
        db.query(PointsTopupRequestModel)
        .filter(PointsTopupRequestModel.id == request_id)
        .first()
    )
    if not request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Topup request not found")

    if request.created_by_user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can cancel only your own topup request",
        )

    if request.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only pending topup requests can be cancelled",
        )

    request.status = "cancelled"
    request.resolved_by_user_id = current_user.id
    request.resolved_at = datetime.utcnow()
    db.commit()
    db.refresh(request)
    return PointsTopupRequestEntry.model_validate(request)


@router.get("/rules")
def get_rules(current_user: User = Depends(get_current_user)) -> dict:
    return {"flat_cost_per_request": POINTS_COST_PER_REQUEST}


@router.get("/activity-summary", response_model=PointsActivitySummaryResponse)
def get_activity_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    days: int = Query(30, ge=1, le=90),
) -> PointsActivitySummaryResponse:
    today = datetime.utcnow().date()
    start_day = today - timedelta(days=days - 1)
    start_datetime = datetime.combine(start_day, datetime.min.time())

    rows = (
        db.query(
            func.date(PointsLedger.created_at).label("day"),
            func.sum(case((PointsLedger.status == "topup", PointsLedger.amount), else_=0)).label("topup"),
            func.sum(case((PointsLedger.status == "refunded", PointsLedger.amount), else_=0)).label("refunded"),
            func.sum(case((PointsLedger.status == "spent", -PointsLedger.amount), else_=0)).label("spent"),
        )
        .filter(
            PointsLedger.user_id == current_user.id,
            PointsLedger.created_at >= start_datetime,
        )
        .group_by(func.date(PointsLedger.created_at))
        .order_by(func.date(PointsLedger.created_at).asc())
        .all()
    )

    row_map = {
        str(row.day): {
            "topup": int(row.topup or 0),
            "refunded": int(row.refunded or 0),
            "spent": int(row.spent or 0),
        }
        for row in rows
    }

    items: list[PointsActivitySummaryDay] = []
    for offset in range(days):
        day = start_day + timedelta(days=offset)
        date_key = day.isoformat()
        values = row_map.get(date_key, {"topup": 0, "refunded": 0, "spent": 0})
        net = values["topup"] + values["refunded"] - values["spent"]
        items.append(
            PointsActivitySummaryDay(
                date=date_key,
                topup=values["topup"],
                refunded=values["refunded"],
                spent=values["spent"],
                net=net,
            )
        )

    return PointsActivitySummaryResponse(days=days, items=items)


@router.get("/my-point", response_model=MyPointResponse)
def get_my_point(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
) -> MyPointResponse:
    from db.models import PointsTopup
    
    total = db.query(PointsLedger).filter(PointsLedger.user_id == current_user.id).count()
    entries = (
        db.query(PointsLedger)
        .filter(PointsLedger.user_id == current_user.id)
        .order_by(PointsLedger.created_at.desc(), PointsLedger.id.desc())
        .limit(limit)
        .offset(offset)
        .all()
    )

    balance = get_user_balance(db, current_user.id)
    
    # Check for point expiration
    now = datetime.utcnow()
    next_expiry = (
        db.query(PointsTopup)
        .filter(
            PointsTopup.user_id == current_user.id,
            PointsTopup.expires_at.isnot(None),
            PointsTopup.expires_at > now
        )
        .order_by(PointsTopup.expires_at.asc())
        .first()
    )
    
    expires_at = next_expiry.expires_at if next_expiry else None
    
    if expires_at:
        days_remaining = (expires_at - now).days
        if days_remaining <= 0:
            expiry_status = "expired"
        elif days_remaining <= 7:
            expiry_status = "expiring_soon"
        else:
            expiry_status = "active"
    else:
        expiry_status = "no_expiry"
    
    point_status = "available" if balance > 0 else "empty"

    return MyPointResponse(
        user_id=current_user.id,
        available_points=balance,
        point_status=point_status,
        expires_at=expires_at,
        expiry_status=expiry_status,
        history=[PointsLedgerEntry.model_validate(entry) for entry in entries],
        total=total,
        limit=limit,
        offset=offset,
    )
