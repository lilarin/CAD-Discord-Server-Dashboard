import asyncio
from typing import Optional
from urllib.parse import unquote

import disnake
from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from backend.schemas import ResponseWrapper
from backend.services.cache import update_logs_cache
from backend.services.fetch import fetch_user
from backend.services.supabase_client import supabase, save_log_to_supabase
from backend.utils.user import get_user_group

from gotrue.errors import AuthApiError


class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.method == "OPTIONS" or request.url.path in ["/", "/docs", "/openapi.json"]:
            response = await call_next(request)
            return response

        try:
            authorization: Optional[str] = request.headers.get("Authorization")
            if not authorization or not authorization.startswith("Bearer "):
                raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")

            token = authorization.split(" ")[1]
            user_data = supabase.auth.get_user(token)

            if user_data.user and user_data.user.user_metadata:
                user = await fetch_user(user_data.user.user_metadata["provider_id"])
                user_group, _ = await get_user_group(user)
                if user_group and user_group == "staff":
                    request.state.user = user_data.user
                    action = request.headers.get("X-Request-Source-Method")
                    if action:
                        action_text = unquote(action)
                        asyncio.create_task(save_log_to_supabase(user, action_text))
                        asyncio.create_task(update_logs_cache())
                    response = await call_next(request)
                    return response
                else:
                    raise HTTPException(status_code=403, detail="Forbidden")
            else:
                raise HTTPException(status_code=401, detail="Invalid token")
        except Exception as exception:
            response = ResponseWrapper(data=None, success=False, error=str(exception))
            if isinstance(exception, HTTPException):
                return JSONResponse(content=response.model_dump(), status_code=exception.status_code)
            elif isinstance(exception, disnake.errors.HTTPException) or isinstance(exception, AuthApiError):
                return JSONResponse(content=response.model_dump(), status_code=exception.status)
            return JSONResponse(content=response.model_dump(), status_code=500)
