from fastapi import APIRouter

from route.v1.home import router as home_router

router = APIRouter()
router.include_router(home_router)
