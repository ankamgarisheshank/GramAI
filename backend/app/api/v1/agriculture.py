from fastapi import APIRouter, Depends
from typing import List
from app.schemas.response import StandardResponse
from app.schemas.agriculture import MarketPriceResponse, WeatherResponse
from app.services.agriculture_service import AgricultureService
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/market-prices", response_model=StandardResponse[List[MarketPriceResponse]])
def get_market_prices():
    service = AgricultureService()
    return StandardResponse(data=service.get_market_prices())

@router.get("/weather/{location_id}", response_model=StandardResponse[WeatherResponse])
def get_weather(location_id: str):
    service = AgricultureService()
    return StandardResponse(data=service.get_weather(location_id))
