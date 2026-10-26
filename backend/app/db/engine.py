from sqlalchemy import create_engine
from app.db.connection import settings

# Create synchronous engine
connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}
engine_kwargs = {}
if not settings.DATABASE_URL.startswith("sqlite"):
    engine_kwargs["pool_size"] = settings.POOL_SIZE
    engine_kwargs["max_overflow"] = settings.MAX_OVERFLOW

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    echo=settings.ECHO_SQL,
    connect_args=connect_args,
    **engine_kwargs
)
