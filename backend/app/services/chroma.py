import logging
import chromadb
from chromadb.config import Settings as ChromaSettings
from typing import Optional

from app.core.config import settings

logger = logging.getLogger(__name__)

class ChromaClientManager:
    def __init__(self) -> None:
        self._client: Optional[chromadb.ClientAPI] = None

    def get_client(self) -> chromadb.ClientAPI:
        if self._client is not None:
            return self._client

        try:
            if settings.CHROMA_HOST:
                logger.info(f"Connecting to remote ChromaDB at {settings.CHROMA_HOST}:{settings.CHROMA_PORT}")
                self._client = chromadb.HttpClient(
                    host=settings.CHROMA_HOST,
                    port=str(settings.CHROMA_PORT or 8000),
                    settings=ChromaSettings(allow_reset=settings.DEBUG)
                )
            else:
                logger.info(f"Initializing local persistent ChromaDB at {settings.CHROMA_PERSISTENT_DIR}")
                self._client = chromadb.PersistentClient(
                    path=settings.CHROMA_PERSISTENT_DIR,
                    settings=ChromaSettings(allow_reset=settings.DEBUG)
                )
            return self._client
        except Exception as e:
            logger.error(f"Failed to connect to/initialize ChromaDB: {e}")
            raise

chroma_manager = ChromaClientManager()

def get_chroma_client() -> chromadb.ClientAPI:
    """FastAPI dependency to retrieve the ChromaDB client."""
    return chroma_manager.get_client()
