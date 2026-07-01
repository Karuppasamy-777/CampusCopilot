import asyncio
import logging
from app.core.database import engine, Base
# Import models to ensure they are registered on the Base before creation
import app.models # noqa

logger = logging.getLogger(__name__)

async def init_db() -> None:
    """
    Initialize the database by creating all tables.
    """
    logger.info("Initializing database tables...")
    try:
        async with engine.begin() as conn:
            # Create tables asynchronously
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables initialized successfully.")
    except Exception as e:
        logger.error(f"Error initializing database: {e}")
        raise

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(init_db())
