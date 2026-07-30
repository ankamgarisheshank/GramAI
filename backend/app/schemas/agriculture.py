from pydantic import BaseModel
from typing import Optional, Dict, Any

class WeatherResponse(BaseModel):
    location_key: str
    temperature: Optional[float]
    humidity: Optional[int]
    forecast_data: Optional[Dict[str, Any]]
    
class MarketPriceResponse(BaseModel):
    crop_name: str
    market_name: str
    price_per_quintal: float
