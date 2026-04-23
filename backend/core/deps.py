from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from core.security import TokenError, safe_decode_token
from db.models import RoleEnum, User
from db.session import get_db
from services.users import get_user_by_id
from services.users import is_demo_expired


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v2/auth/login")


def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme),
) -> User:
    try:
        payload = safe_decode_token(token)
    except TokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    if payload.get("type") != "access":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    subject = payload.get("sub")
    if not subject:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    user = get_user_by_id(db, int(subject))
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Inactive user")
    if is_demo_expired(user):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Demo account expired")

    return user


def require_role(*roles: RoleEnum):
    def _dependency(user: User = Depends(get_current_user)) -> User:
        if user.role not in roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
        return user

    return _dependency


def block_demo_write(request: Request, user: User = Depends(get_current_user)) -> None:
    if user.role == RoleEnum.demo_user and request.method in {"POST", "PUT", "PATCH", "DELETE"}:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Demo user is read-only")


def require_owner(resource_owner_id: int, current_user: User) -> None:
    if current_user.role == RoleEnum.super_user:
        return
    if resource_owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found")
