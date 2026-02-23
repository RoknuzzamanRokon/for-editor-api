from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.v1.router import router as api_v1_router
from api.v2.router import router as api_v2_router
from db.session import SessionLocal, init_db
from services.users import ensure_default_super_user

app = FastAPI()

# Add CORS middleware for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_v1_router)
app.include_router(api_v2_router)


@app.on_event("startup")
def on_startup() -> None:
    init_db()
    db = SessionLocal()
    try:
        ensure_default_super_user(db)
    finally:
        db.close()
