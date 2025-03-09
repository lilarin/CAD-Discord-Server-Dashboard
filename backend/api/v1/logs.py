from fastapi import APIRouter, HTTPException

from backend.middlewares.uniform_response import uniform_response_middleware
from backend.schemas import LogSchema
from backend.services.cache import get_logs_from_cache

router = APIRouter()


@router.get("/logs", response_model=list[LogSchema])
@uniform_response_middleware
async def get_logs():
    try:
        return await get_logs_from_cache()
    except Exception as exception:
        raise HTTPException(status_code=500, detail=str(exception))
