"""Top-up packages and request routing.

Two product rules live here, and nowhere else:

**Pricing.** A top-up is either a named package or a custom amount. Custom
amounts bill at the base rate with a $5 / 250-point floor; the named packages
buy progressively better rates, and the two largest also carry admin access.

**Routing.** A user never picks who fulfils their request:

    account created by an admin  -> that admin
    self-registered account      -> a super user

Prices are integer cents and points are integers — no floats anywhere on the
money path. The resolved price/points/admin-flag are copied onto the request row
at creation time, so editing this catalogue later never rewrites history.
"""

from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from db.models import RoleEnum, User


# Base rate for custom amounts: $5.00 -> 250 points.
MIN_TOPUP_CENTS = 500
MIN_TOPUP_POINTS = 250
CUSTOM_POINTS_PER_CENT = MIN_TOPUP_POINTS / MIN_TOPUP_CENTS  # 0.5 points per cent

CUSTOM_PACKAGE_KEY = "custom"

TOPUP_PACKAGES: dict[str, dict] = {
    "small": {
        "key": "small",
        "label": "Small",
        "price_cents": 3_000,
        "points": 2_100,
        "grants_admin_access": False,
        "description": "Best for occasional conversion work.",
    },
    "medium": {
        "key": "medium",
        "label": "Medium",
        "price_cents": 10_000,
        "points": 11_000,
        "grants_admin_access": True,
        "description": "High volume, plus admin access.",
    },
    "large": {
        "key": "large",
        "label": "Large",
        "price_cents": 20_000,
        "points": 30_000,
        "grants_admin_access": True,
        "description": "Maximum value, plus admin access.",
    },
}


def points_for_cents(price_cents: int) -> int:
    """Points a custom top-up of `price_cents` is worth, at the base rate."""
    return int(price_cents * CUSTOM_POINTS_PER_CENT)


def list_packages() -> list[dict]:
    """Catalogue for the picker: the custom tier first, then named packages."""
    custom = {
        "key": CUSTOM_PACKAGE_KEY,
        "label": "Custom",
        "price_cents": MIN_TOPUP_CENTS,
        "points": MIN_TOPUP_POINTS,
        "grants_admin_access": False,
        "description": f"Any amount from ${MIN_TOPUP_CENTS / 100:.0f}, billed at the base rate.",
    }
    ordered = ["small", "medium", "large"]
    return [custom] + [TOPUP_PACKAGES[key] for key in ordered]


def resolve_package(package_key: str, price_cents: Optional[int]) -> dict:
    """Turns a requested package (or custom amount) into concrete terms.

    Returns ``{package_key, price_cents, points, grants_admin_access}``. Raises
    400 when a custom amount is missing or below the floor, or when the package
    key is not in the catalogue.
    """
    if package_key == CUSTOM_PACKAGE_KEY:
        if price_cents is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A custom top-up needs an amount",
            )
        if price_cents < MIN_TOPUP_CENTS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Minimum top-up is ${MIN_TOPUP_CENTS / 100:.2f} "
                    f"({MIN_TOPUP_POINTS} points)"
                ),
            )
        return {
            "package_key": CUSTOM_PACKAGE_KEY,
            "price_cents": price_cents,
            "points": points_for_cents(price_cents),
            "grants_admin_access": False,
        }

    package = TOPUP_PACKAGES.get(package_key)
    if not package:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unknown top-up package '{package_key}'",
        )

    return {
        "package_key": package["key"],
        "price_cents": package["price_cents"],
        "points": package["points"],
        "grants_admin_access": package["grants_admin_access"],
    }


def resolve_request_target(db: Session, user: User) -> User:
    """Who fulfils `user`'s top-up request.

    An admin-created account goes to its creator; a self-registered account goes
    to a super user. Falls back to a super user whenever the recorded creator is
    gone or is no longer able to fulfil (deactivated, or demoted out of an
    admin role), so a request can never be routed into a dead end.
    """
    if user.created_by_user_id:
        creator = db.query(User).filter(User.id == user.created_by_user_id).first()
        if (
            creator
            and creator.is_active
            and creator.role in {RoleEnum.admin_user, RoleEnum.super_user}
        ):
            return creator

    super_user = (
        db.query(User)
        .filter(User.role == RoleEnum.super_user, User.is_active.is_(True))
        .order_by(User.id.asc())
        .first()
    )
    if not super_user:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="No administrator is available to receive top-up requests",
        )
    return super_user


def grant_admin_access(user: User) -> bool:
    """Promotes a fulfilled buyer to admin_user. Returns True if the role changed.

    Never touches an existing admin_user or super_user — this only ever raises a
    standard account, it does not demote anyone.
    """
    if user.role in {RoleEnum.admin_user, RoleEnum.super_user}:
        return False
    user.role = RoleEnum.admin_user
    return True
