"""API v2 router - auth required."""
from fastapi import APIRouter, Depends

from api.v2.endpoints.converters import router as converters_router
from api.v2.endpoints.home import router as home_router
from route.v2.require_auth import require_auth

router = APIRouter(prefix="/api/v2", dependencies=[Depends(require_auth)])

router.include_router(home_router)
router.include_router(converters_router)
