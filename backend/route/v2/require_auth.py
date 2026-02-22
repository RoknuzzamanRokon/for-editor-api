"""Auth dependency placeholder for API v2."""
from fastapi import HTTPException, status


def require_auth():
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Auth is not configured yet",
    )
