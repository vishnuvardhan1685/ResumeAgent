from functools import lru_cache
from typing import List

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Resume Agent Service"
    environment: str = "development"
    cors_origins: List[str] = Field(default_factory=lambda: ["http://localhost:5173"])

    mongo_uri: str | None = None
    mongo_db_name: str = "resume_agent"
    postgres_dsn: str | None = None

    serpapi_key: str | None = None
    gemini_api_key: str | None = None
    internshala_base_url: str = "https://internshala.com"
    embedding_model_name: str = "sentence-transformers/all-MiniLM-L6-v2"

    request_timeout_seconds: int = 30

    model_config = SettingsConfigDict(
        env_file=(".env", "agent_service/.env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
