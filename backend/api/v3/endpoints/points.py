from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from core.deps import get_current_user, require_role
from core.points import POINTS_COST_PER_REQUEST, get_user_balance, topup_points
from db.models import PointsLedger, PointsTopupRequest as PointsTopupRequestModel, RoleEnum, User
from db.session import get_db
from models.points import (
    MyPointResponse,
    PointsBalanceResponse,
    PointsLedgerList,
    PointsLedgerEntry,
    PointsTopupCreateRequest,
    PointsTopupRequest,
    PointsTopupRequestEntry,
    PointsTopupRequestList,
    PointsTopupResponse,
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

    balance = topup_points(
        db,
        user_id=payload.user_id,
        amount=payload.amount,
        created_by_user_id=current_user.id,
        note=payload.note,
    )
    return PointsTopupResponse(user_id=payload.user_id, balance=balance)


@router.post("/topup-requests", response_model=PointsTopupRequestEntry, status_code=status.HTTP_201_CREATED)
def create_topup_request(
    payload: PointsTopupCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> PointsTopupRequestEntry:
    target_user = get_user_by_id(db, payload.user_id)
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    requested_admin = get_user_by_id(db, payload.requested_admin_user_id)
    if not requested_admin:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Requested admin not found")
    if requested_admin.role not in {RoleEnum.admin_user, RoleEnum.super_user}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Requested user must be an admin or super user",
        )

    if current_user.role not in {RoleEnum.admin_user, RoleEnum.super_user} and payload.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Users can only request topups for their own account",
        )

    if (
        requested_admin.role == RoleEnum.admin_user
        and target_user.created_by_user_id != requested_admin.id
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Selected admin is not allowed to manage this user",
        )

    request = PointsTopupRequestModel(
        user_id=payload.user_id,
        requested_admin_user_id=payload.requested_admin_user_id,
        amount=payload.amount,
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


@router.get("/rules")
def get_rules(current_user: User = Depends(get_current_user)) -> dict:
    return {"flat_cost_per_request": POINTS_COST_PER_REQUEST}


@router.get("/my-point", response_model=MyPointResponse)
def get_my_point(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
) -> MyPointResponse:
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
    point_status = "available" if balance > 0 else "empty"

    # Current schema has no points-expiry table/rule, so we return explicit non-expiring status.
    return MyPointResponse(
        user_id=current_user.id,
        available_points=balance,
        point_status=point_status,
        expires_at=None,
        expiry_status="no_expiry_configured",
        history=[PointsLedgerEntry.model_validate(entry) for entry in entries],
        total=total,
        limit=limit,
        offset=offset,
    )
