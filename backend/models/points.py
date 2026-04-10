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


class PointsTopupRequest(BaseModel):
    user_id: int
    amount: int = Field(gt=0)
    note: Optional[str] = None


class PointsTopupResponse(BaseModel):
    user_id: int
    balance: int


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
