from datetime import datetime, timedelta
from typing import Any, Dict
from uuid import uuid4

import bcrypt
from jose import JWTError, jwt

from core.config import settings


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


def decode_token(token: str) -> Dict[str, Any]:
    return jwt.decode(token, settings.secret_key, algorithms=[settings.jwt_algorithm])


class TokenError(Exception):
    pass


def safe_decode_token(token: str) -> Dict[str, Any]:
    try:
        return decode_token(token)
    except JWTError as exc:
        raise TokenError("Invalid token") from exc
