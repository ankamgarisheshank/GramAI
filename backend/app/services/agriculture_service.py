from typing import List
from app.schemas.agriculture import MarketPriceResponse, WeatherResponse

class AgricultureService:
    def __init__(self):
        pass

    def get_market_prices(self) -> List[MarketPriceResponse]:
        return [
            MarketPriceResponse(crop_name="Paddy", market_name="Nizamabad", price_per_quintal=2200.0),
            MarketPriceResponse(crop_name="Cotton", market_name="Warangal", price_per_quintal=7500.0),
            MarketPriceResponse(crop_name="Red Gram", market_name="Suryapet", price_per_quintal=6800.0)
        ]

    def get_weather(self, location_id: str) -> WeatherResponse:
        return WeatherResponse(
            location_key=location_id,
            temperature=32.5,
            humidity=65,
            forecast_data={"condition": "Sunny", "rain_chance": "10%"}
        )
