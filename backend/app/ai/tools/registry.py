import logging

logger = logging.getLogger("ai.tools")

class ToolRegistry:
    @staticmethod
    def get_weather(location: str):
        logger.info(f"Tool execution: get_weather({location})")
        return {"temperature": 32, "condition": "Sunny"}

    @staticmethod
    def get_market_prices(crop: str):
        logger.info(f"Tool execution: get_market_prices({crop})")
        return {"price_per_quintal": 2200}
