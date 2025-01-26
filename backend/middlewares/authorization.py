from typing import Optional

from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from supabase import create_client, Client

from backend.common.variables import variables
from backend.config import config
from backend.middlewares.schemas import ResponseWrapper

supabase: Client = create_client(variables.SUPABASE_URL, config.supabase_key)


class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.method == "OPTIONS" or request.url.path == "/":
            response = await call_next(request)
            return response

        try:
            authorization: Optional[str] = request.headers.get("Authorization")
            if not authorization or not authorization.startswith("Bearer "):
                raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")

            token = authorization.split(" ")[1]

            user_data = supabase.auth.get_user(token)
            if user_data.user:
                request.state.user = user_data.user
                response = await call_next(request)
                return response
            else:
                raise HTTPException(status_code=401, detail="Invalid token")
        except Exception as exception:
            response = ResponseWrapper(data=None, success=False, error=str(exception))
            if isinstance(exception, HTTPException):
                return JSONResponse(content=response.model_dump(), status_code=exception.status_code)
            return JSONResponse(content=response.model_dump(), status_code=500)
