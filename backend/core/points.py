from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, Optional
from uuid import uuid4

from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from db.models import PointsLedger, PointsTopup, RoleEnum, User, UserPoints

POINTS_COST_PER_REQUEST = 3

DEFAULT_ROLE_POINTS: dict[RoleEnum, int] = {
    RoleEnum.demo_user: 0,
    RoleEnum.general_user: 30,
    RoleEnum.admin_user: 100,
    RoleEnum.super_user: 0,
}


@dataclass(frozen=True)
class ChargeResult:
    charged: bool
    already_processed: bool
    balance: Optional[int]
    request_id: str
    existing_result: Optional[Dict[str, Any]]


class InsufficientPointsError(Exception):
    def __init__(self, balance: int, required: int = POINTS_COST_PER_REQUEST) -> None:
        self.balance = balance
        self.required = required


def _get_or_create_points(db: Session, user_id: int) -> UserPoints:
    points = db.query(UserPoints).filter(UserPoints.user_id == user_id).first()
    if points:
        return points
    points = UserPoints(user_id=user_id, balance=0)
    db.add(points)
    db.flush()
    return points


def get_user_balance(db: Session, user_id: int) -> int:
    points = _get_or_create_points(db, user_id)
    return points.balance


def charge_points(
    db: Session,
    user: User,
    action: str,
    request_id: Optional[str],
    meta: Optional[Dict[str, Any]] = None,
) -> ChargeResult:
    if user.role == RoleEnum.super_user:
        return ChargeResult(
            charged=False,
            already_processed=False,
            balance=None,
            request_id=request_id or str(uuid4()),
            existing_result=None,
        )

    request_id = request_id or str(uuid4())

    existing = (
        db.query(PointsLedger)
        .filter(
            PointsLedger.user_id == user.id,
            PointsLedger.action == action,
            PointsLedger.request_id == request_id,
            PointsLedger.status == "spent",
        )
        .first()
    )
    if existing:
        existing_result = None
        if isinstance(existing.meta_json, dict):
            existing_result = existing.meta_json.get("result")
        return ChargeResult(
            charged=False,
            already_processed=True,
            balance=get_user_balance(db, user.id),
            request_id=request_id,
            existing_result=existing_result,
        )

    try:
        with db.begin():
            points = (
                db.query(UserPoints)
                .filter(UserPoints.user_id == user.id)
                .with_for_update()
                .first()
            )
            if not points:
                points = UserPoints(user_id=user.id, balance=0)
                db.add(points)
                db.flush()

            if points.balance < POINTS_COST_PER_REQUEST:
                raise InsufficientPointsError(points.balance, POINTS_COST_PER_REQUEST)

            points.balance -= POINTS_COST_PER_REQUEST
            ledger = PointsLedger(
                user_id=user.id,
                action=action,
                amount=-POINTS_COST_PER_REQUEST,
                status="spent",
                request_id=request_id,
                meta_json=meta or {},
            )
            db.add(ledger)
    except IntegrityError:
        db.rollback()
        existing = (
            db.query(PointsLedger)
            .filter(
                PointsLedger.user_id == user.id,
                PointsLedger.action == action,
                PointsLedger.request_id == request_id,
                PointsLedger.status == "spent",
            )
            .first()
        )
        existing_result = None
        if existing and isinstance(existing.meta_json, dict):
            existing_result = existing.meta_json.get("result")
        return ChargeResult(
            charged=False,
            already_processed=True,
            balance=get_user_balance(db, user.id),
            request_id=request_id,
            existing_result=existing_result,
        )

    return ChargeResult(
        charged=True,
        already_processed=False,
        balance=get_user_balance(db, user.id),
        request_id=request_id,
        existing_result=None,
    )


def record_conversion_result(
    db: Session,
    user_id: int,
    action: str,
    request_id: str,
    result: Dict[str, Any],
) -> None:
    ledger = (
        db.query(PointsLedger)
        .filter(
            PointsLedger.user_id == user_id,
            PointsLedger.action == action,
            PointsLedger.request_id == request_id,
            PointsLedger.status == "spent",
        )
        .first()
    )
    if not ledger:
        return
    meta = ledger.meta_json or {}
    meta["result"] = result
    ledger.meta_json = meta
    db.commit()


def refund_points(
    db: Session,
    user_id: int,
    action: str,
    request_id: str,
    amount: int = POINTS_COST_PER_REQUEST,
    meta: Optional[Dict[str, Any]] = None,
) -> bool:
    if not request_id:
        return False

    with db.begin():
        existing_refund = (
            db.query(PointsLedger)
            .filter(
                PointsLedger.user_id == user_id,
                PointsLedger.action == action,
                PointsLedger.request_id == request_id,
                PointsLedger.status == "refunded",
            )
            .first()
        )
        if existing_refund:
            return False

        points = (
            db.query(UserPoints)
            .filter(UserPoints.user_id == user_id)
            .with_for_update()
            .first()
        )
        if not points:
            points = UserPoints(user_id=user_id, balance=0)
            db.add(points)
            db.flush()

        points.balance += amount
        ledger = PointsLedger(
            user_id=user_id,
            action=action,
            amount=amount,
            status="refunded",
            request_id=request_id,
            meta_json=meta or {},
        )
        db.add(ledger)
    return True


def topup_points(
    db: Session,
    user_id: int,
    amount: int,
    created_by_user_id: Optional[int],
    note: Optional[str] = None,
) -> int:
    if amount <= 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Amount must be positive")

    request_id = f"topup-{uuid4()}"
    with db.begin():
        points = (
            db.query(UserPoints)
            .filter(UserPoints.user_id == user_id)
            .with_for_update()
            .first()
        )
        if not points:
            points = UserPoints(user_id=user_id, balance=0)
            db.add(points)
            db.flush()

        points.balance += amount
        ledger = PointsLedger(
            user_id=user_id,
            action="topup",
            amount=amount,
            status="topup",
            request_id=request_id,
            meta_json={"note": note} if note else {},
        )
        db.add(ledger)
        db.add(
            PointsTopup(
                user_id=user_id,
                amount=amount,
                created_by_user_id=created_by_user_id,
                note=note,
            )
        )
    return points.balance
