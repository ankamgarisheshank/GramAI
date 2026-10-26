import httpx
import logging
from typing import Dict, Any, List
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from cachetools import TTLCache
from app.core.config import settings

logger = logging.getLogger("gramai")

# Cache to store results for 1 hour (3600 seconds), max 1000 items
scheme_cache = TTLCache(maxsize=1000, ttl=3600)

class ExternalSchemeService:
    """
    Service to fetch schemes and data from external 3rd party APIs.
    """
    def __init__(self):
        # Fallback defaults if environment variables are not set
        self.farmer_api_url = getattr(settings, 'FARMER_API_URL', "https://api.example.com/farmer-schemes")
        self.student_api_url = getattr(settings, 'STUDENT_API_URL', "https://api.example.com/student-schemes")
        self.senior_citizen_api_url = getattr(settings, 'SENIOR_API_URL', "https://api.example.com/senior-pension")
        self.timeout = 10.0

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type((httpx.RequestError, httpx.HTTPStatusError)),
        reraise=True
    )
    async def _fetch_with_retry(self, url: str, params: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
            return response.json()

    async def _fetch_data(self, url: str, params: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """Generic method to fetch data with caching and retry logic."""
        cache_key = f"{url}:{str(params)}"
        if cache_key in scheme_cache:
            logger.info(f"Returning cached data for {url}")
            return scheme_cache[cache_key]

        try:
            logger.info(f"Fetching data from external API: {url}")
            data = await self._fetch_with_retry(url, params)
            scheme_cache[cache_key] = data
            return data
        except httpx.HTTPStatusError as e:
            logger.error(f"External API error for {url}: {e}")
            return []
        except httpx.RequestError as e:
            logger.error(f"Network error when connecting to {url}: {e}")
            return []
        except Exception as e:
            logger.error(f"Unexpected error when connecting to {url}: {e}", exc_info=True)
            return []

    async def get_farmer_schemes(self, location: str = None) -> List[Dict[str, Any]]:
        """Fetch schemes for farmers."""
        params = {"location": location} if location else {}
        return await self._fetch_data(self.farmer_api_url, params)

    async def get_student_schemes(self, location: str = None) -> List[Dict[str, Any]]:
        """Fetch schemes for students."""
        params = {"location": location} if location else {}
        return await self._fetch_data(self.student_api_url, params)

    async def get_senior_citizen_pensions(self, location: str = None) -> List[Dict[str, Any]]:
        """Fetch pension release info for senior citizens."""
        params = {"location": location} if location else {}
        return await self._fetch_data(self.senior_citizen_api_url, params)
