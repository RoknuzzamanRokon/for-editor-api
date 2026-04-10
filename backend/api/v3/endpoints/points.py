from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from core.deps import get_current_user, require_role
from core.points import POINTS_COST_PER_REQUEST, get_user_balance, topup_points
from db.models import PointsLedger, RoleEnum, User
from db.session import get_db
from models.points import (
    MyPointResponse,
    PointsBalanceResponse,
    PointsLedgerList,
    PointsLedgerEntry,
    PointsTopupRequest,
    PointsTopupResponse,
)
from services.users import get_user_by_id

router = APIRouter(prefix="/points", tags=["points"])


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

    balance = topup_points(
        db,
        user_id=payload.user_id,
        amount=payload.amount,
        created_by_user_id=current_user.id,
        note=payload.note,
    )
    return PointsTopupResponse(user_id=payload.user_id, balance=balance)


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
