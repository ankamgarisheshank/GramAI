from fastapi import Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from app.schemas.response import StandardResponse, ErrorDetail
import logging

logger = logging.getLogger("gramai")

class AppException(Exception):
    def __init__(self, message: str, status_code: int = 400, payload: dict = None):
        self.message = message
        self.status_code = status_code
        self.payload = payload

async def app_exception_handler(request: Request, exc: AppException):
    logger.warning(f"AppException: {exc.message}")
    response = StandardResponse(
        success=False,
        message=exc.message
    ).model_dump()
    
    if exc.payload and isinstance(exc.payload, dict):
        response.update(exc.payload)
        
    return JSONResponse(status_code=exc.status_code, content=response)

async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = [
        ErrorDetail(field=".".join(map(str, err.get("loc", []))), issue=err.get("msg", ""))
        for err in exc.errors()
    ]
    response = StandardResponse(
        success=False,
        message="Validation Failed",
        errors=errors
    )
    return JSONResponse(status_code=422, content=response.model_dump())

async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled Exception: {str(exc)}", exc_info=True)
    response = StandardResponse(
        success=False,
        message="Internal Server Error"
    )
    return JSONResponse(status_code=500, content=response.model_dump())
