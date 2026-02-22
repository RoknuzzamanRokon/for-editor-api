"""API v1 router - no auth required."""
from fastapi import APIRouter

from api.v1.endpoints.converters import router as converters_router
from api.v1.endpoints.home import router as home_router

router = APIRouter(prefix="/api/v1")

router.include_router(home_router)
router.include_router(converters_router)
