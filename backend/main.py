from fastapi import FastAPI
from route.home import router as home_router
from route.converter import router as converter_router

app = FastAPI()

app.include_router(home_router)
app.include_router(converter_router)
