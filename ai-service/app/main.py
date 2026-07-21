from fastapi import FastAPI

from app.api.routes import router

app = FastAPI(
    title="AI Incident Service",
    version="1.0"
)

app.include_router(router)