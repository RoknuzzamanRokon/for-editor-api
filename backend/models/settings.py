from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

from db.models import RoleEnum

ThemeName = Literal["light", "ocean", "sunset", "forest"]
AvatarKey = Literal[
    "avatar_1",
    "avatar_2",
    "avatar_3",
    "avatar_4",
    "avatar_5",
    "avatar_6",
    "avatar_7",
    "avatar_8",
    "avatar_9",
    "avatar_10",
]

VALID_THEMES = {"light", "ocean", "sunset", "forest"}
VALID_AVATARS = {
    "avatar_1",
    "avatar_2",
    "avatar_3",
    "avatar_4",
    "avatar_5",
    "avatar_6",
    "avatar_7",
    "avatar_8",
    "avatar_9",
    "avatar_10",
}


class AccountIdentity(BaseModel):
    id: int
    email: str
    username: str | None = None
    role: RoleEnum
    created_at: datetime
    last_login: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


class AccountPreferences(BaseModel):
    theme: ThemeName
    avatar_key: AvatarKey
    security_alerts_enabled: bool
    login_notifications_enabled: bool
    profile_private: bool


class AccountSettingsResponse(BaseModel):
    identity: AccountIdentity
    preferences: AccountPreferences


class AccountProfileUpdateRequest(BaseModel):
    username: str | None = Field(default=None, max_length=255)

    @field_validator("username")
    @classmethod
    def validate_username(cls, value: str | None) -> str | None:
        if value is None:
            return None
        cleaned = value.strip()
        if not cleaned:
            return None
        if len(cleaned) < 3:
            raise ValueError("Username must be at least 3 characters long")
        return cleaned[:1].upper() + cleaned[1:]


class AccountPreferencesUpdateRequest(BaseModel):
    theme: ThemeName | None = None
    avatar_key: AvatarKey | None = None
    security_alerts_enabled: bool | None = None
    login_notifications_enabled: bool | None = None
    profile_private: bool | None = None


class ChangePasswordRequest(BaseModel):
    current_password: str = Field(min_length=6)
    new_password: str = Field(min_length=8)

    @field_validator("new_password")
    @classmethod
    def validate_new_password(cls, value: str) -> str:
        if len(value.strip()) < 8:
            raise ValueError("New password must be at least 8 characters long")
        return value


class ChangePasswordResponse(BaseModel):
    success: bool = True
    message: str
