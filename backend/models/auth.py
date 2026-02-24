from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from db.models import RoleEnum


class LoginRequest(BaseModel):
    email: str  # Changed from EmailStr to allow local emails
    password: str = Field(min_length=6)
    
    @field_validator('email')
    @classmethod
    def validate_email(cls, v: str) -> str:
        """Validate email format (lenient for local development)"""
        if not v or '@' not in v:
            raise ValueError("Invalid email format")
        return v


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
    email: str  # Changed from EmailStr to allow local emails like admin@local
    username: Optional[str] = None
    role: RoleEnum
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
    
    @field_validator('email')
    @classmethod
    def validate_email(cls, v: str) -> str:
        """Validate email format (lenient for local development)"""
        if not v or '@' not in v:
            raise ValueError("Invalid email format")
        return v


class UserRoleUpdate(BaseModel):
    role: RoleEnum


class UserDisableResponse(BaseModel):
    id: int
    is_active: bool

    model_config = ConfigDict(from_attributes=True)
