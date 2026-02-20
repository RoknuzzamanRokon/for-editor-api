from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from route.api_v1 import router as api_v1_router

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
