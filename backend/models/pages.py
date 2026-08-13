from typing import List

from pydantic import BaseModel


class PageDefinition(BaseModel):
    page_key: str
    label: str
    path: str
    area: str
    icon: str
    locked: bool
    description: str


class PageAccessEntry(PageDefinition):
    allowed: bool


class PageAccessListResponse(BaseModel):
    user_id: int
    role: str
    pages: List[PageAccessEntry]


class PageToggle(BaseModel):
    page_key: str
    is_allowed: bool


class PageUpdateRequest(BaseModel):
    pages: List[PageToggle]


class PagePatchRequest(BaseModel):
    is_allowed: bool
