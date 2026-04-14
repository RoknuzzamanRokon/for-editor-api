from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from core.deps import block_demo_write, get_current_user
from db.session import get_db
from models.auth import AccessTokenResponse, LoginRequest, TokenPair, TokenRefreshRequest, UserOut
from models.settings import (
    AccountProfileUpdateRequest,
    AccountSettingsResponse,
    ChangePasswordRequest,
    ChangePasswordResponse,
    AccountPreferencesUpdateRequest,
)
from services import auth as auth_service
from services import settings as settings_service

router = APIRouter(prefix="/auth", tags=["auth"])

# Phase 2 forgot-password contract:
# - POST /auth/forgot-password to create a reset token and enqueue email delivery.
# - POST /auth/reset-password to validate the reset token and write the new password hash.
# - Add a reset-token persistence model with expiry/revocation support plus email integration.


@router.post("/login", response_model=TokenPair)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> TokenPair:
    user = auth_service.authenticate_user(db, payload.email, payload.password)
    access_token, refresh_token = auth_service.create_token_pair(db, user)
    return TokenPair(access_token=access_token, refresh_token=refresh_token)


@router.post("/refresh", response_model=AccessTokenResponse)
def refresh(payload: TokenRefreshRequest, db: Session = Depends(get_db)) -> AccessTokenResponse:
    access_token = auth_service.refresh_access_token(db, payload.refresh_token)
    return AccessTokenResponse(access_token=access_token)


@router.get("/me", response_model=UserOut)
def me(current_user=Depends(get_current_user)) -> UserOut:
    return current_user


@router.get("/settings", response_model=AccountSettingsResponse)
def get_account_settings(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
) -> AccountSettingsResponse:
    return settings_service.build_account_settings_response(db, current_user)


@router.patch(
    "/settings/profile",
    response_model=AccountSettingsResponse,
    dependencies=[Depends(block_demo_write)],
)
def update_account_profile(
    payload: AccountProfileUpdateRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
) -> AccountSettingsResponse:
    settings_service.update_username(db, current_user, payload.username)
    return settings_service.build_account_settings_response(db, current_user)


@router.patch(
    "/settings/preferences",
    response_model=AccountSettingsResponse,
    dependencies=[Depends(block_demo_write)],
)
def update_account_preferences(
    payload: AccountPreferencesUpdateRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
) -> AccountSettingsResponse:
    settings_service.update_preferences(db, current_user, payload)
    return settings_service.build_account_settings_response(db, current_user)


@router.post(
    "/settings/change-password",
    response_model=ChangePasswordResponse,
    dependencies=[Depends(block_demo_write)],
)
def change_account_password(
    payload: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
) -> ChangePasswordResponse:
    settings_service.change_password(db, current_user, payload.current_password, payload.new_password)
    return ChangePasswordResponse(message="Password updated successfully")
