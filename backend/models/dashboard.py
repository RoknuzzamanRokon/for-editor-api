from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class DashboardUserInfo(BaseModel):
    id: int
    email: str
    username: Optional[str] = None
    role: str
    is_active: bool
    created_at: datetime


class DashboardSummary(BaseModel):
    monthly_requests: int
    remaining_points: int
    success_rate: float
    avg_latency_ms: Optional[float] = None
    total_conversions: int
    success_conversions: int
    failed_conversions: int
    processing_conversions: int
    active_api_count: int


class DashboardPerformanceDay(BaseModel):
    date: str
    total: int
    success: int
    failed: int
    processing: int


class DashboardApiEntry(BaseModel):
    action: str
    label: str
    route: str
    method: str
    points: int
    usage_count: int = 0
    last_used_at: Optional[str] = None
    success_rate: float
    description: str


class DashboardRecentHistoryItem(BaseModel):
    id: int
    action: str
    endpoint: str
    status: str
    input_filename: str
    points_charged: int
    duration_ms: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    download_url: Optional[str] = None


class DashboardOverviewResponse(BaseModel):
    user: DashboardUserInfo
    summary: DashboardSummary
    performance_30_days: list[DashboardPerformanceDay]
    active_apis: list[DashboardApiEntry]
    recent_history: list[DashboardRecentHistoryItem]


# --- Usage history -----------------------------------------------------------


class UsageHistorySummary(BaseModel):
    total_requests: int
    success_requests: int
    failed_requests: int
    processing_requests: int
    success_rate: float
    points_spent: int
    points_topped_up: int
    points_refunded: int
    points_balance: int
    endpoints_used: int
    avg_duration_ms: Optional[float] = None
    first_used_at: Optional[datetime] = None
    last_used_at: Optional[datetime] = None


class UsageHistoryTrendDay(BaseModel):
    date: str
    total: int
    success: int
    failed: int


class UsagePointsTrendDay(BaseModel):
    date: str
    topup: int
    spent: int
    refunded: int


class UsageHistoryEndpointEntry(BaseModel):
    action: str
    label: str
    route: str
    method: str
    total: int
    success: int
    failed: int
    success_rate: float
    points_spent: int
    last_used_at: Optional[datetime] = None
    # False when the action was used historically but access has since been
    # revoked — the row still appears so past usage never silently vanishes.
    allowed: bool


class UsageHistoryItem(BaseModel):
    id: int
    action: str
    label: str
    status: str
    input_filename: str
    points_charged: int
    duration_ms: Optional[int] = None
    created_at: datetime
    updated_at: datetime


class UsageHistoryResponse(BaseModel):
    days: int
    summary: UsageHistorySummary
    request_trend: list[UsageHistoryTrendDay]
    points_trend: list[UsagePointsTrendDay]
    endpoints: list[UsageHistoryEndpointEntry]
    total: int
    limit: int
    offset: int
    items: list[UsageHistoryItem]
