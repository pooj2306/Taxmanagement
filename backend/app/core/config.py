from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    APP_NAME: str = Field(default="E-Commerce API")

    # Default to local Postgres in Docker; fall back to SQLite for quick local dev
    DATABASE_URL: str = Field(
        default="sqlite+pysqlite:///./dev.db",
        description="SQLAlchemy database URL",
    )


settings = Settings()  # type: ignore[call-arg]
