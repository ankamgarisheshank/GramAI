import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DEFAULT_DB_FILE = BASE_DIR / "gramai_local.db"

class DatabaseSettings(BaseSettings):
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "gram123456"
    POSTGRES_DB: str = "gramai_db"
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: str = "5432"

    DATABASE_URL: str | None = None

    POOL_SIZE: int = 20
    MAX_OVERFLOW: int = 10
    ECHO_SQL: bool = False

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def database_url(self):
        env_url = os.getenv("DATABASE_URL") or self.DATABASE_URL
        if env_url:
            if env_url.startswith("postgres://"):
                env_url = env_url.replace("postgres://", "postgresql://", 1)
            return env_url
        return f"sqlite:///{DEFAULT_DB_FILE}"

settings = DatabaseSettings()
settings.DATABASE_URL = settings.database_url
