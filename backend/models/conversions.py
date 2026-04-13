from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class ConversionCreateResponse(BaseModel):
    conversion_id: int
    status: str
    download_url: Optional[str] = None
    points_charged: int
    remaining_balance: Optional[int] = None


class ConversionHistoryItem(BaseModel):
    id: int
    owner_user_id: int
    action: str
    input_filename: str
    status: str
    points_charged: int
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    download_url: Optional[str] = None


class ConversionStatusResponse(BaseModel):
    conversion_id: int
    action: str
    input_filename: str
    status: str
    error_message: Optional[str] = None
    points_charged: int
    remaining_balance: Optional[int] = None
    download_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class ConversionHistoryResponse(BaseModel):
    items: list[ConversionHistoryItem]
    limit: int
