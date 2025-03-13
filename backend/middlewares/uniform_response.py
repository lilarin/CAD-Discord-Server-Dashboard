from functools import wraps

from fastapi.exceptions import HTTPException
from fastapi.responses import JSONResponse

from backend.schemas import ResponseWrapper


def uniform_response_middleware(func):
    @wraps(func)
    async def wrapper(*args, **kwargs):
        try:
            result = await func(*args, **kwargs)
            response = ResponseWrapper(data=result, success=True, error=None)
            return JSONResponse(content=response.model_dump())

        except Exception as exception:
            response = ResponseWrapper(data=None, success=False, error=str(exception))
            if isinstance(exception, HTTPException):
                return JSONResponse(content=response.model_dump(), status_code=exception.status_code)
            return JSONResponse(content=response.model_dump(), status_code=500)

    return wrapper
