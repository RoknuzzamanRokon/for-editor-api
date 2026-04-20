"""API v3 router - auth + RBAC + points + permissions."""
from fastapi import APIRouter

from api.v3.endpoints.admin import router as admin_router
from api.v3.endpoints.converters import router as converters_router
from api.v3.endpoints.dashboard import router as dashboard_router
from api.v3.endpoints.deploy import router as deploy_router
from api.v3.endpoints.permissions import router as permissions_router
from api.v3.endpoints.points import router as points_router

router = APIRouter(prefix="/api/v3", tags=["v3"])

router.include_router(points_router)
router.include_router(permissions_router)
router.include_router(converters_router)
router.include_router(dashboard_router)
router.include_router(admin_router)
router.include_router(deploy_router)
