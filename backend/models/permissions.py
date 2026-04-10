from datetime import datetime
from typing import List

from pydantic import BaseModel, ConfigDict


class PermissionAction(BaseModel):
    action: str
    is_allowed: bool


class PermissionUpdateRequest(BaseModel):
    permissions: List[PermissionAction]


class PermissionPatchRequest(BaseModel):
    is_allowed: bool


class PermissionEntry(BaseModel):
    id: int
    user_id: int
    action: str
    is_allowed: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PermissionListResponse(BaseModel):
    user_id: int
    permissions: List[PermissionEntry]


class MyApiEntry(BaseModel):
    action: str
    label: str


class MyApiListResponse(BaseModel):
    user_id: int
    apis: List[MyApiEntry]
