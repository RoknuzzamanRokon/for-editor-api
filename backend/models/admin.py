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


class AdminActiveUserEntry(BaseModel):
    id: int
    email: str
    username: Optional[str] = None
    role: str
    is_active: bool
    created_at: datetime
    last_login: Optional[datetime] = None
    last_active_at: Optional[datetime] = None
    balance: int


class AdminActiveUsersResponse(BaseModel):
    total: int
    limit: int
    offset: int
    items: List[AdminActiveUserEntry]


class AdminPointGivingHistoryEntry(BaseModel):
    id: int
    user_id: int
    user_email: str
    user_username: Optional[str] = None
    amount: int
    note: Optional[str] = None
    created_at: datetime
    created_by_user_id: Optional[int] = None
    created_by_email: Optional[str] = None
    created_by_username: Optional[str] = None


class AdminPointGivingHistoryResponse(BaseModel):
    total: int
    limit: int
    offset: int
    items: List[AdminPointGivingHistoryEntry]


class AdminTopupRequestEntry(BaseModel):
    id: int
    user_id: int
    user_email: str
    user_username: Optional[str] = None
    requested_admin_user_id: int
    requested_admin_email: str
    requested_admin_username: Optional[str] = None
    amount: int
    note: Optional[str] = None
    status: str
    created_by_user_id: int
    created_by_email: str
    created_by_username: Optional[str] = None
    resolved_by_user_id: Optional[int] = None
    resolved_by_email: Optional[str] = None
    resolved_by_username: Optional[str] = None
    resolved_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


class AdminTopupRequestListResponse(BaseModel):
    total: int
    limit: int
    offset: int
    items: List[AdminTopupRequestEntry]


class AdminDashboardQuickStat(BaseModel):
    label: str
    value: int
    icon: str


class AdminDashboardActivityEntry(BaseModel):
    user_id: int
    user_email: str
    user_username: Optional[str] = None
    points_change: int
    action: str
    occurred_at: datetime


class AdminDashboardSystemMetric(BaseModel):
    label: str
    value: str
    tone: Optional[str] = None


class AdminDashboardRequestTrendDay(BaseModel):
    date: str
    total: int
    success: int
    failed: int
    processing: int


class AdminDashboardPointsTrendDay(BaseModel):
    date: str
    topup: int
    spent: int
    refunded: int


class AdminDashboardSummaryResponse(BaseModel):
    quick_stats: List[AdminDashboardQuickStat]
    recent_activity: List[AdminDashboardActivityEntry]
    system_status: List[AdminDashboardSystemMetric]
    request_trend_30_days: List[AdminDashboardRequestTrendDay]
    points_activity_30_days: List[AdminDashboardPointsTrendDay]
