import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.v1.router import api_router
from app.services.db_init import init_db

# Configure logger
logging.basicConfig(
    level=logging.INFO if not settings.DEBUG else logging.DEBUG,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup actions
    logger.info("Starting up CampusCopilot API...")
    #try:
        # Automatically run migrations/table creation in development
     #   if settings.APP_ENV == "development":
      #      await init_db()
    #except Exception as e:
     #   logger.error(f"Startup database initialization failed: {e}")
    
    yield
    
    # Shutdown actions
    logger.info("Shutting down CampusCopilot API...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan,
    debug=settings.DEBUG,
)

# CORS middleware configuration
# Modify in production to strict origin lists
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register v1 router
app.include_router(api_router, prefix=settings.API_V1_STR)  # touched to reload exceptions config

@app.get("/")
def read_root():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME}!",
        "docs_url": "/docs",
        "version": "1.0.0"
    }
