import os
from pydantic_settings import BaseSettings

class AppSettings(BaseSettings):
    PROJECT_NAME: str = "GramAI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-key-for-dev")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    ALLOWED_HOSTS: list[str] = ["*"]
    CORS_ORIGINS: list[str] = [
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,*"
        ).split(",")
        if origin.strip()
    ]
    
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

settings = AppSettings()
