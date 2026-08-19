from datetime import datetime, timedelta
from typing import Any, Dict
from uuid import uuid4

import bcrypt
from jose import JWTError, jwt

from core.config import settings


def _warmup_bcrypt() -> None:
    """
    Prime bcrypt internals during startup so first login request is faster.
    """
    try:
        probe = b"warmup"
        probe_hash = bcrypt.hashpw(probe, bcrypt.gensalt(rounds=4))
        bcrypt.checkpw(probe, probe_hash)
    except Exception:
        # Never block startup on warmup failure.
        pass


_warmup_bcrypt()


def get_password_hash(password: str) -> str:
    """Hash a password using bcrypt."""
    password_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a bcrypt hash."""
    password_bytes = plain_password.encode('utf-8')
    hashed_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(password_bytes, hashed_bytes)


def create_access_token(subject: str, expires_delta: timedelta | None = None) -> str:
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.access_token_expire_minutes))
    to_encode: Dict[str, Any] = {
        "sub": subject,
        "type": "access",
        "exp": expire,
        "iat": datetime.utcnow(),
    }
    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.jwt_algorithm)


def create_refresh_token(subject: str, jti: str | None = None, expires_delta: timedelta | None = None) -> str:
    expire = datetime.utcnow() + (expires_delta or timedelta(days=settings.refresh_token_expire_days))
    token_jti = jti or str(uuid4())
    to_encode: Dict[str, Any] = {
        "sub": subject,
        "type": "refresh",
        "jti": token_jti,
        "exp": expire,
        "iat": datetime.utcnow(),
    }
    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.jwt_algorithm)


def create_refresh_token_with_jti(
    subject: str, expires_delta: timedelta | None = None
) -> tuple[str, str]:
    token_jti = str(uuid4())
    token = create_refresh_token(subject=subject, jti=token_jti, expires_delta=expires_delta)
    return token, token_jti


def decode_token(token: str) -> Dict[str, Any]:
    return jwt.decode(token, settings.secret_key, algorithms=[settings.jwt_algorithm])


class TokenError(Exception):
    pass


def safe_decode_token(token: str) -> Dict[str, Any]:
    try:
        return decode_token(token)
    except JWTError as exc:
        raise TokenError("Invalid token") from exc


def create_unsubscribe_token(contact_id: int) -> str:
    """A long-lived, unauthenticated link a marketing-email recipient can click
    to opt out. No expiry — an unsubscribe link that goes stale would force
    someone back into inbound mail just to ask to stop receiving it."""
    to_encode: Dict[str, Any] = {"sub": f"marketing_unsubscribe:{contact_id}", "type": "marketing_unsubscribe"}
    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.jwt_algorithm)


def decode_unsubscribe_token(token: str) -> int:
    """Returns the contact_id encoded in an unsubscribe token, or raises TokenError."""
    try:
        payload = decode_token(token)
    except JWTError as exc:
        raise TokenError("Invalid token") from exc

    subject = payload.get("sub", "")
    if payload.get("type") != "marketing_unsubscribe" or not subject.startswith("marketing_unsubscribe:"):
        raise TokenError("Invalid token")

    try:
        return int(subject.split(":", 1)[1])
    except ValueError as exc:
        raise TokenError("Invalid token") from exc
