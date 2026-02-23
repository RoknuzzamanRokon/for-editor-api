from datetime import datetime, timedelta

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from core.config import settings
from core.security import (
    TokenError,
    create_access_token,
    create_refresh_token,
    safe_decode_token,
    verify_password,
)
from db.models import RefreshToken, User
from services.users import get_user_by_email, get_user_by_id


def authenticate_user(db: Session, email: str, password: str) -> User:
    user = get_user_by_email(db, email)
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Inactive user")
    return user


def create_token_pair(db: Session, user: User) -> tuple[str, str]:
    access_token = create_access_token(subject=str(user.id))
    refresh_expires = datetime.utcnow() + timedelta(days=settings.refresh_token_expire_days)
    refresh_token = create_refresh_token(subject=str(user.id))

    payload = safe_decode_token(refresh_token)
    token_jti = payload.get("jti")
    if not token_jti:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Refresh token invalid")

    refresh_row = RefreshToken(
        user_id=user.id,
        token_jti=token_jti,
        revoked=False,
        expires_at=refresh_expires,
    )
    db.add(refresh_row)
    db.commit()

    return access_token, refresh_token


def refresh_access_token(db: Session, refresh_token: str) -> str:
    try:
        payload = safe_decode_token(refresh_token)
    except TokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    if payload.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    token_jti = payload.get("jti")
    subject = payload.get("sub")
    if not token_jti or not subject:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    token_row = db.query(RefreshToken).filter(RefreshToken.token_jti == token_jti).first()
    if not token_row or token_row.revoked:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token revoked")

    if token_row.expires_at < datetime.utcnow():
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token expired")

    user = get_user_by_id(db, int(subject))
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid user")

    return create_access_token(subject=str(user.id))
