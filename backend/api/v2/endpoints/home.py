from fastapi import APIRouter

from route.v2.home import router as home_router

router = APIRouter()
router.include_router(home_router)
