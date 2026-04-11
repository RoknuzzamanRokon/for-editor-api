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
