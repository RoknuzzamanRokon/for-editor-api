from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from api.v1.router import router as api_v1_router
from api.v2.router import router as api_v2_router
from api.v3.router import router as api_v3_router
from core.points import InsufficientPointsError
from core.permissions import ConversionNotPermittedError
from db.session import SessionLocal, init_db
from services.users import ensure_default_super_user

app = FastAPI()

# Add CORS middleware for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000","http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_v1_router)
app.include_router(api_v2_router)
app.include_router(api_v3_router)


@app.on_event("startup")
def on_startup() -> None:
    init_db()
    db = SessionLocal()
    try:
        ensure_default_super_user(db)
    finally:
        db.close()


@app.exception_handler(InsufficientPointsError)
def handle_insufficient_points(_: object, exc: InsufficientPointsError) -> JSONResponse:
    return JSONResponse(
        status_code=402,
        content={
            "detail": "Insufficient points",
            "required": exc.required,
            "balance": exc.balance,
        },
    )


@app.exception_handler(ConversionNotPermittedError)
def handle_conversion_not_permitted(_: object, exc: ConversionNotPermittedError) -> JSONResponse:
    return JSONResponse(
        status_code=403,
        content={"detail": "Conversion not permitted", "action": exc.action},
    )
