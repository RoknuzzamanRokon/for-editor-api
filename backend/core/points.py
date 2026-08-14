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
        db.commit()
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
    db.commit()
    
    return True


def _lock_balances(db: Session, user_ids: list[int]) -> dict[int, UserPoints]:
    """Locks the given balance rows FOR UPDATE, creating any that are missing.

    Rows are always locked in ascending user_id order. Two transfers running at
    once between the same pair of accounts (A funds B while B funds A) would
    otherwise be able to grab the two rows in opposite orders and deadlock.
    """
    rows: dict[int, UserPoints] = {}
    for uid in sorted(set(user_ids)):
        row = (
            db.query(UserPoints)
            .filter(UserPoints.user_id == uid)
            .with_for_update()
            .first()
        )
        if not row:
            row = UserPoints(user_id=uid, balance=0)
            db.add(row)
            db.flush()
        rows[uid] = row
    return rows


def topup_points(
    db: Session,
    user_id: int,
    amount: int,
    created_by_user_id: Optional[int],
    note: Optional[str] = None,
    expires_at: Optional[Any] = None,
) -> int:
    """Moves `amount` points to `user_id`, debiting the funder when there is one.

    Points are pre-funded, never conjured mid-chain:

        super_user -> own balance   issuance; this is where points enter the system
        super_user -> someone else  debits the super user
        admin_user -> customer      debits the admin
        admin_user -> own balance   rejected
        no creator                  system grant (signup bonus)

    Both sides of a transfer — the funder's debit and the recipient's credit —
    are written in a single transaction with one commit at the end, so a transfer
    can never land half-applied.
    """
    if amount <= 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Amount must be positive")

    request_id = f"topup-{uuid4()}"

    creator: Optional[User] = None
    if created_by_user_id is not None:
        creator = db.query(User).filter(User.id == created_by_user_id).first()

    is_self_topup = creator is not None and creator.id == user_id

    if creator and creator.role == RoleEnum.admin_user and is_self_topup:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admin cannot top up their own balance",
        )

    # A transfer between two accounts always comes out of the sender's balance.
    # A super user crediting themselves is issuance, and a creator-less grant is
    # a system grant — neither has a funder to debit.
    debits_creator = (
        creator is not None
        and creator.role in {RoleEnum.admin_user, RoleEnum.super_user}
        and not is_self_topup
    )

    if debits_creator:
        assert creator is not None  # narrowed by debits_creator
        balances = _lock_balances(db, [creator.id, user_id])
        creator_points = balances[creator.id]
        points = balances[user_id]

        if creator_points.balance < amount:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Admin does not have enough points to transfer"
                    if creator.role == RoleEnum.admin_user
                    else "Super user does not have enough points to transfer"
                ),
            )

        creator_points.balance -= amount
        db.add(
            PointsLedger(
                user_id=creator.id,
                action="admin_points_transfer",
                amount=-amount,
                status="spent",
                request_id=f"{request_id}-admin-out",
                meta_json={
                    "target_user_id": user_id,
                    "note": note,
                },
            )
        )
    else:
        points = _lock_balances(db, [user_id])[user_id]

    points.balance += amount
    # The credit records who funded it, so an account's own ledger is enough to
    # answer "where did these points come from" without a join.
    credit_meta: dict[str, Any] = {}
    if note:
        credit_meta["note"] = note
    if creator is not None:
        credit_meta["source_user_id"] = creator.id
        credit_meta["source_role"] = (
            creator.role.value if hasattr(creator.role, "value") else str(creator.role)
        )

    db.add(
        PointsLedger(
            user_id=user_id,
            action="topup",
            amount=amount,
            status="topup",
            request_id=request_id,
            meta_json=credit_meta,
        )
    )
    db.add(
        PointsTopup(
            user_id=user_id,
            amount=amount,
            created_by_user_id=created_by_user_id,
            note=note,
            expires_at=expires_at,
        )
    )

    # Tell the recipient their balance went up. Added to this same transaction so
    # the notification and the credit land together — nobody is ever told about
    # points that did not arrive. Self-issuance is skipped: a super user crediting
    # their own wallet does not need to be notified about it.
    if not is_self_topup:
        _notify_points_credited(
            db,
            recipient_id=user_id,
            amount=amount,
            new_balance=points.balance,
            funder=creator,
            note=note,
        )

    db.commit()

    return points.balance


def _notify_points_credited(
    db: Session,
    recipient_id: int,
    amount: int,
    new_balance: int,
    funder: Optional[User],
    note: Optional[str],
) -> None:
    """Queues the 'you received points' notification. Never raises."""
    # Imported here rather than at module scope: services/ sits above core/, and
    # a top-level import would invert the layering for a purely optional concern.
    from services.notifications import notify_users

    if funder is not None:
        who = funder.username or funder.email
        source = f" from {who}"
    else:
        source = ""

    body = f"{amount:,} points were added to your account{source}."
    if note:
        body += f' Note: "{note}"'
    body += f" Your balance is now {new_balance:,} points."

    try:
        notify_users(
            db,
            user_ids=[recipient_id],
            title=f"You received {amount:,} points",
            message=body,
            category="success",
            sender_user_id=funder.id if funder else None,
        )
    except Exception:
        # A notification must never cost someone their points. The transfer has
        # already been applied above and still commits.
        pass
