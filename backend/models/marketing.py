from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


ContactStatus = str  # new | contacted | responded | won | lost | unsubscribed
ResponseDirection = str  # outbound | inbound


class ContactCreateRequest(BaseModel):
    email: EmailStr
    company_name: Optional[str] = Field(default=None, max_length=255)
    contact_name: Optional[str] = Field(default=None, max_length=255)
    notes: Optional[str] = Field(default=None, max_length=2000)


class ContactUpdateRequest(BaseModel):
    status: Optional[str] = None
    company_name: Optional[str] = Field(default=None, max_length=255)
    contact_name: Optional[str] = Field(default=None, max_length=255)
    notes: Optional[str] = Field(default=None, max_length=2000)


class ContactEntry(BaseModel):
    id: int
    email: str
    company_name: Optional[str] = None
    contact_name: Optional[str] = None
    status: str
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    last_activity_at: Optional[datetime] = None


class ContactList(BaseModel):
    total: int
    limit: int
    offset: int
    items: list[ContactEntry]


class ResponseEntry(BaseModel):
    id: int
    contact_id: int
    campaign_id: Optional[int] = None
    direction: str
    subject: Optional[str] = None
    body: str
    status: Optional[str] = None
    error_message: Optional[str] = None
    sender_label: Optional[str] = None
    created_at: datetime


class ContactThread(BaseModel):
    contact: ContactEntry
    items: list[ResponseEntry]


class LogReplyRequest(BaseModel):
    subject: Optional[str] = Field(default=None, max_length=200)
    body: str = Field(min_length=1, max_length=5000)


class CampaignCreateRequest(BaseModel):
    subject: str = Field(min_length=1, max_length=200)
    body_html: str = Field(min_length=1, max_length=20000)
    contact_ids: list[int] = Field(default_factory=list)
    new_emails: list[EmailStr] = Field(default_factory=list)


class CampaignCreateResponse(BaseModel):
    id: int
    subject: str
    recipient_count: int
    created_at: datetime


class CampaignEntry(BaseModel):
    id: int
    subject: str
    body_html: str
    category: str
    recipient_count: int
    sent_count: int
    failed_count: int
    created_at: datetime


class CampaignList(BaseModel):
    total: int
    limit: int
    offset: int
    items: list[CampaignEntry]
