import disnake
from fastapi import APIRouter, HTTPException, Body

from backend.middlewares.uniform_response import uniform_response_middleware
from backend.schemas import QueueRequestBody
from backend.utils.messages import create_queue_message

router = APIRouter()


@router.post("/queue")
@uniform_response_middleware
async def create_queue(request_body: QueueRequestBody = Body(...)):
    try:
        await create_queue_message(
            request_body.channel_id, request_body.title, request_body.event_time
        )
    except disnake.errors.HTTPException as exception:
        raise HTTPException(status_code=exception.status, detail=str(exception.text))
    except Exception as exception:
        raise HTTPException(status_code=500, detail=str(exception))
