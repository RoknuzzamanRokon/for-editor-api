import time
from collections import defaultdict, deque

from fastapi import HTTPException, Request, status

_WINDOW_SECONDS = 60
_MAX_ATTEMPTS = 10

_attempts: dict[str, deque] = defaultdict(deque)


def enforce_login_rate_limit(request: Request) -> None:
    key = request.client.host if request.client else "unknown"
    now = time.monotonic()

    window = _attempts[key]
    while window and now - window[0] > _WINDOW_SECONDS:
        window.popleft()

    if len(window) >= _MAX_ATTEMPTS:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many login attempts. Please wait a moment and try again.",
        )

    window.append(now)
