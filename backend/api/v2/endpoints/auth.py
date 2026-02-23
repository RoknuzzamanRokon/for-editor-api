from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from core.deps import get_current_user
from db.session import get_db
from models.auth import AccessTokenResponse, LoginRequest, TokenPair, TokenRefreshRequest, UserOut
from services import auth as auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


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
