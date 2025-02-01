from fastapi import APIRouter, HTTPException

from backend.middlewares.uniform_response import uniform_response_middleware
from backend.schemas import LogSchema
from backend.services.supabase_client import read_logs_from_supabase

router = APIRouter()


@router.get("/logs", response_model=list[LogSchema])
@uniform_response_middleware
async def get_logs():
    try:
        return await read_logs_from_supabase()
    except Exception as exception:
        raise HTTPException(status_code=500, detail=str(exception))
