from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from app.core.config import settings
from app.core.exceptions import AppException, app_exception_handler, validation_exception_handler, global_exception_handler
from app.middleware.logging_middleware import RequestLoggingMiddleware

from app.api.v1 import (
    auth, health, users, profiles, schemes, recommendations, 
    agriculture, voice, chat, notifications, admin, analytics
)

def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.VERSION,
        openapi_url=f"{settings.API_V1_STR}/openapi.json"
    )

    # Middlewares
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.add_middleware(RequestLoggingMiddleware)

    # Exception Handlers
    app.add_exception_handler(AppException, app_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(Exception, global_exception_handler)

    # Routers
    app.include_router(health.router, prefix=settings.API_V1_STR, tags=["Health"])
    app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["Auth"])
    app.include_router(users.router, prefix=f"{settings.API_V1_STR}/users", tags=["Users"])
    app.include_router(profiles.router, prefix=f"{settings.API_V1_STR}/profiles", tags=["Profiles"])
    app.include_router(schemes.router, prefix=f"{settings.API_V1_STR}/schemes", tags=["Schemes"])
    app.include_router(recommendations.router, prefix=f"{settings.API_V1_STR}/recommendations", tags=["Recommendations"])
    app.include_router(agriculture.router, prefix=f"{settings.API_V1_STR}/agriculture", tags=["Agriculture"])
    app.include_router(voice.router, prefix=f"{settings.API_V1_STR}/voice", tags=["Voice"])
    app.include_router(chat.router, prefix=f"{settings.API_V1_STR}/chat", tags=["Chat"])
    app.include_router(notifications.router, prefix=f"{settings.API_V1_STR}/notifications", tags=["Notifications"])
    app.include_router(admin.router, prefix=f"{settings.API_V1_STR}/admin", tags=["Admin"])
    app.include_router(analytics.router, prefix=f"{settings.API_V1_STR}/analytics", tags=["Analytics"])

    return app

app = create_app()
