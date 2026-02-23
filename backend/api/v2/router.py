"""API v2 router - auth + RBAC required."""
from fastapi import APIRouter, Depends

from api.v2.endpoints.auth import router as auth_router
from api.v2.endpoints.converters import router as converters_router
from api.v2.endpoints.home import router as home_router
from api.v2.endpoints.users import router as users_router
from core.deps import get_current_user

router = APIRouter(prefix="/api/v2", tags=["v2"])

router.include_router(auth_router)
router.include_router(users_router)
router.include_router(home_router, dependencies=[Depends(get_current_user)])
router.include_router(converters_router)
