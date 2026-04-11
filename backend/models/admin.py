from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


class AdminCheckUserApiEntry(BaseModel):
    action: str
    label: str
    route: str
    method: str
    allowed: bool
    points: int
    last_used_at: Optional[datetime] = None
    success_rate: float
    description: str


class AdminCheckUserPointsSummary(BaseModel):
    balance: int
    total_topup: int
    total_spent: int
    total_refunded: int
    last_points_activity_at: Optional[datetime] = None


class AdminCheckUserConversionSummary(BaseModel):
    total: int
    success: int
    failed: int
    processing: int
    last_conversion_at: Optional[datetime] = None


class AdminCheckUserResponse(BaseModel):
    id: int
    email: str
    username: Optional[str] = None
    role: str
    position: str
    is_active: bool
    created_at: datetime
    last_login: Optional[datetime] = None
    last_active_at: Optional[datetime] = None
    points: AdminCheckUserPointsSummary
    conversions: AdminCheckUserConversionSummary
    active_apis: List[AdminCheckUserApiEntry]
    api_permissions: List[AdminCheckUserApiEntry]
