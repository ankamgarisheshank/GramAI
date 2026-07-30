from sqlalchemy import String, Integer, Float, JSON
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base_model import Base, TimestampMixin

class WeatherCache(Base, TimestampMixin):
    __tablename__ = "weather_cache"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    location_key: Mapped[str] = mapped_column(String(100), unique=True, index=True) # e.g. "district_mandal"
    temperature: Mapped[float] = mapped_column(Float, nullable=True)
    humidity: Mapped[int] = mapped_column(Integer, nullable=True)
    forecast_data: Mapped[dict] = mapped_column(JSON, nullable=True)

class MarketPrice(Base, TimestampMixin):
    __tablename__ = "market_prices"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    crop_name: Mapped[str] = mapped_column(String(100), index=True)
    market_name: Mapped[str] = mapped_column(String(150), index=True)
    price_per_quintal: Mapped[float] = mapped_column(Float)
