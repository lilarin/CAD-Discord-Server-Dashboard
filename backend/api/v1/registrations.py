import disnake
from fastapi import APIRouter, HTTPException, Body

from backend.middlewares.uniform_response import uniform_response_middleware
from backend.schemas import RegistrationRequestBody
from backend.utils.registration import create_registration_message

router = APIRouter()


@router.post("/registration")
@uniform_response_middleware
async def create_registration(request_body: RegistrationRequestBody = Body(...)):
    try:
        await create_registration_message(request_body.channel_id)
    except disnake.errors.HTTPException as exception:
        raise HTTPException(status_code=exception.status, detail=str(exception.text))
    except Exception as exception:
        raise HTTPException(status_code=500, detail=str(exception))
