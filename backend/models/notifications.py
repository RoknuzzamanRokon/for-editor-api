from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field


NotificationCategory = Literal["info", "success", "warning", "alert"]

# "all"      -> every user on the platform (super_user only)
# "my_users" -> every user the sender created (admin_user; super_user may also use it)
# "selected" -> an explicit user_ids list, still intersected with the sender's pool
NotificationAudience = Literal["all", "my_users", "selected"]


class NotificationCreateRequest(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    message: str = Field(min_length=1, max_length=2000)
    category: NotificationCategory = "info"
    audience: NotificationAudience = "selected"
    user_ids: list[int] = Field(default_factory=list)


class NotificationCreateResponse(BaseModel):
    id: int
    audience: str
    recipient_count: int
    created_at: datetime


class NotificationSenderSummary(BaseModel):
    id: int
    email: str
    username: Optional[str] = None
    role: str

    model_config = ConfigDict(from_attributes=True)


class InboxEntry(BaseModel):
    """One row of the current user's inbox (a notification_recipients row joined
    to its notification)."""

    id: int
    notification_id: int
    title: str
    message: str
    category: str
    is_read: bool
    read_at: Optional[datetime] = None
    created_at: datetime
    sender: Optional[NotificationSenderSummary] = None


class InboxList(BaseModel):
    total: int
    unread: int
    limit: int
    offset: int
    items: list[InboxEntry]


class UnreadCountResponse(BaseModel):
    unread: int


class MarkReadResponse(BaseModel):
    updated: int
    unread: int


class SentEntry(BaseModel):
    id: int
    title: str
    message: str
    category: str
    audience: str
    recipient_count: int
    read_count: int
    created_at: datetime


class SentList(BaseModel):
    total: int
    limit: int
    offset: int
    items: list[SentEntry]


class AudienceUserEntry(BaseModel):
    id: int
    email: str
    username: Optional[str] = None
    role: str

    model_config = ConfigDict(from_attributes=True)


class AudienceResponse(BaseModel):
    """The set of users the caller is permitted to notify, used to populate the
    recipient picker. `scope` is "all" for super_user, "created_by_me" for admin_user."""

    scope: str
    total: int
    items: list[AudienceUserEntry]
