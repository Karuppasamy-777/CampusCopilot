from fastapi import APIRouter

from app.api.v1.endpoints import auth, status, chat

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(status.router, tags=["system"])
api_router.include_router(chat.router, prefix="/chat", tags=["ai_assistant"])
