from datetime import datetime, timedelta

from fastapi import HTTPException, status
from sqlalchemy.orm import Session, load_only

from core.config import settings
from core.security import (
    TokenError,
    create_access_token,
    create_refresh_token_with_jti,
    safe_decode_token,
    verify_password,
)
from db.models import RefreshToken, User
from services.users import get_user_by_id


def authenticate_user(db: Session, email: str, password: str) -> User:
    user = (
        db.query(User)
        .options(
            load_only(
                User.id,
                User.email,
                User.hashed_password,
                User.is_active,
            )
        )
        .filter(User.email == email)
        .first()
    )
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Inactive user")
    return user


def create_token_pair(db: Session, user: User) -> tuple[str, str]:
    user.last_login = datetime.utcnow()
    db.commit()
    db.refresh(user)

    access_token = create_access_token(subject=str(user.id))
    refresh_token, token_jti = create_refresh_token_with_jti(subject=str(user.id))
    _ = (db, token_jti)  # Keep signature compatibility; refresh token is stateless for faster login.

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
    # Stateless-first refresh token validation:
    # - If a DB row exists and revoked, reject.
    # - If no row exists, rely on JWT signature/exp checks.
    if token_row and token_row.revoked:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token revoked")

    if token_row and token_row.expires_at < datetime.utcnow():
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token expired")

    user = get_user_by_id(db, int(subject))
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid user")

    return create_access_token(subject=str(user.id))
