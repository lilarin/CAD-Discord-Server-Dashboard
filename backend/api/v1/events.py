from fastapi import APIRouter, HTTPException, Body

from backend.middlewares.uniform_response import uniform_response_middleware
from backend.schemas import QueueRequestBody
from backend.services.utils import create_queue_message

router = APIRouter()


@router.post("/queue")
@uniform_response_middleware
async def get_logs(request_body: QueueRequestBody = Body(...)):
    try:
        await create_queue_message(
            request_body.channel_id, request_body.title, request_body.event_time
        )
    except Exception as exception:
        raise HTTPException(status_code=500, detail=str(exception))
