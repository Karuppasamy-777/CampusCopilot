from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", case_sensitive=True, extra="ignore"
    )

    PROJECT_NAME: str = "CampusCopilot API"
    API_V1_STR: str = "/api/v1"
    APP_ENV: str = "development"
    DEBUG: bool = True

    # Database Settings
    DATABASE_URL: str = Field(
        default="postgresql+asyncpg://postgres:postgres@localhost:5432/campuscopilot"
    )

    # Firebase Auth Settings
    FIREBASE_CREDENTIALS_PATH: Optional[str] = None
    FIREBASE_PROJECT_ID: Optional[str] = None

    # ChromaDB Settings
    CHROMA_PERSISTENT_DIR: str = "./chroma_db"
    CHROMA_HOST: Optional[str] = None
    CHROMA_PORT: Optional[int] = None

    # Google ADK / Gemini Settings
    GEMINI_API_KEY: Optional[str] = None

settings = Settings()
