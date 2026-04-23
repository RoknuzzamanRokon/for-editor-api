from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from db.models import RoleEnum
from models.permissions import MyApiEntry
from models.settings import AccountPreferences


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


class DemoRegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    username: Optional[str] = None
    selected_actions: list[str] = Field(min_length=1, max_length=3)

    @field_validator("selected_actions")
    @classmethod
    def validate_selected_actions(cls, value: list[str]) -> list[str]:
        unique_actions = list(dict.fromkeys(value))
        if len(unique_actions) != len(value):
            raise ValueError("Selected actions must be unique")
        if len(unique_actions) > 3:
            raise ValueError("You can select up to 3 APIs")
        if len(unique_actions) == 0:
            raise ValueError("Select at least 1 API")
        return unique_actions


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
    demo_expires_at: Optional[datetime] = None

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


class UserDeleteResponse(BaseModel):
    id: int
    success: bool = True
    message: str


class UserCreatorSummary(BaseModel):
    id: int
    email: str
    username: Optional[str] = None
    role: RoleEnum


class UserPointSummary(BaseModel):
    balance: int
    total_topup: int
    total_spent: int
    total_refunded: int
    last_activity_at: Optional[datetime] = None


class MeResponse(BaseModel):
    id: int
    email: str
    username: Optional[str] = None
    role: RoleEnum
    is_active: bool
    created_at: datetime
    demo_expires_at: Optional[datetime] = None
    last_login: Optional[datetime] = None
    created_by: Optional[UserCreatorSummary] = None
    points: UserPointSummary
    active_api_count: int
    active_apis: list[MyApiEntry]
    preferences: AccountPreferences
