from datetime import datetime
from typing import Any, Dict, Optional

from pydantic import BaseModel, ConfigDict, Field


class PointsBalanceResponse(BaseModel):
    balance: int


class PointsLedgerEntry(BaseModel):
    id: int
    action: str
    amount: int
    status: str
    request_id: str
    meta_json: Optional[Dict[str, Any]] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PointsLedgerList(BaseModel):
    items: list[PointsLedgerEntry]
    limit: int
    offset: int


class PointsActivitySummaryDay(BaseModel):
    date: str
    topup: int
    refunded: int
    spent: int
    net: int


class PointsActivitySummaryResponse(BaseModel):
    days: int
    items: list[PointsActivitySummaryDay]


class PointsTopupRequest(BaseModel):
    user_id: int
    amount: int = Field(gt=0)
    note: Optional[str] = None
    expiry_days: Optional[int] = Field(None, gt=0, description="Days until points expire")


class PointsTopupResponse(BaseModel):
    user_id: int
    balance: int


class PointsTopupCreateRequest(BaseModel):
    user_id: int
    # Which tier is being bought. "custom" additionally requires price_cents.
    package_key: str = "custom"
    price_cents: Optional[int] = Field(None, ge=0)
    # Normally the fulfiller is resolved from the requester's creator
    # (see core.billing_packages.resolve_request_target); an admin or super user
    # may still direct a request explicitly.
    requested_admin_user_id: Optional[int] = None
    note: Optional[str] = None


class PointsTopupRequestEntry(BaseModel):
    id: int
    user_id: int
    requested_admin_user_id: int
    amount: int
    package_key: str = "custom"
    price_cents: int = 0
    grants_admin_access: bool = False
    note: Optional[str] = None
    status: str
    created_by_user_id: int
    resolved_by_user_id: Optional[int] = None
    resolved_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TopupPackage(BaseModel):
    key: str
    label: str
    price_cents: int
    points: int
    grants_admin_access: bool
    description: str


class TopupTarget(BaseModel):
    """Who the caller's top-up request will be routed to."""

    id: int
    email: str
    username: Optional[str] = None
    role: str
    # "creator" when it goes to the admin who made the account, "super_user"
    # when the account is self-registered.
    routing: str


class TopupPackagesResponse(BaseModel):
    min_price_cents: int
    min_points: int
    packages: list[TopupPackage]
    target: TopupTarget


class PointsTopupRequestList(BaseModel):
    items: list[PointsTopupRequestEntry]
    total: int
    limit: int
    offset: int


class MyPointResponse(BaseModel):
    user_id: int
    available_points: int
    point_status: str
    expires_at: Optional[datetime] = None
    expiry_status: str
    history: list[PointsLedgerEntry]
    total: int
    limit: int
    offset: int
