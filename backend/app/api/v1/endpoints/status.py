from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql import text
import chromadb
from typing import Dict, Any

from app.core.database import get_db
from app.services.chroma import get_chroma_client

router = APIRouter()

@router.get("/status", response_model=Dict[str, Any])
async def get_status(
    db: AsyncSession = Depends(get_db),
    chroma_client: chromadb.ClientAPI = Depends(get_chroma_client),
) -> Dict[str, Any]:
    """
    Check health status of the API, PostgreSQL, and ChromaDB.
    """
    status_info = {
        "status": "healthy",
        "database": "unreachable",
        "chromadb": "unreachable",
    }

    # Test PostgreSQL
    try:
        await db.execute(text("SELECT 1"))
        status_info["database"] = "connected"
    except Exception as e:
        status_info["database"] = f"error: {str(e)}"

    # Test ChromaDB
    try:
        chroma_client.heartbeat()
        status_info["chromadb"] = "connected"
    except Exception as e:
        status_info["chromadb"] = f"error: {str(e)}"

    return status_info
