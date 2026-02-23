from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from db.models import RoleEnum


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)


class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class AccessTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenRefreshRequest(BaseModel):
    refresh_token: str


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    username: Optional[str] = None
    role: Optional[RoleEnum] = None


class UserOut(BaseModel):
    id: int
    email: EmailStr
    username: Optional[str] = None
    role: RoleEnum
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserRoleUpdate(BaseModel):
    role: RoleEnum


class UserDisableResponse(BaseModel):
    id: int
    is_active: bool

    model_config = ConfigDict(from_attributes=True)
