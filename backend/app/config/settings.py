"""
Application configuration.

All runtime configuration is sourced from environment variables so the
application behaves identically across local Docker Compose, CI, and a
future Kubernetes deployment. Nothing is hardcoded.
"""

from functools import lru_cache
from typing import List

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Centralized application settings, populated from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # --- Application metadata ---
    app_name: str = Field(default="OpsBoard API")
    app_version: str = Field(default="1.0.0")
    environment: str = Field(default="development")
    debug: bool = Field(default=False)

    # --- API ---
    api_prefix: str = Field(default="/api")
    log_level: str = Field(default="INFO")

    # --- CORS ---
    cors_origins: str = Field(default="http://localhost:5173,http://localhost:3000")

    # --- Database ---
    postgres_user: str = Field(default="opsboard")
    postgres_password: str = Field(default="opsboard")
    postgres_db: str = Field(default="opsboard")
    postgres_host: str = Field(default="postgres")
    postgres_port: int = Field(default=5432)

    # --- Seed data ---
    seed_database: bool = Field(default=True)

    @property
    def database_url(self) -> str:
        """Build the SQLAlchemy database URL from discrete components."""
        return (
            f"postgresql+psycopg2://{self.postgres_user}:{self.postgres_password}"
            f"@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"
        )

    @property
    def cors_origin_list(self) -> List[str]:
        """Parse the comma-separated CORS origins string into a list."""
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    """Return a cached Settings instance so env vars are parsed only once."""
    return Settings()
