import disnake
from fastapi import APIRouter, HTTPException, Body

from backend.middlewares.uniform_response import uniform_response_middleware
from backend.schemas import RegistrationRequestBody, ServerConfig, StaffCategoryRequestBody
from backend.utils.category import check_if_category_exists
from backend.utils.channel import create_text_registration_channel, create_staff_category
from backend.utils.registration import send_registration_message

router = APIRouter()


@router.get("/settings/config", response_model=ServerConfig)
@uniform_response_middleware
async def get_server_config():
    try:
        pass
        # Get whole server config json file with:
        # 1. Server language that used for bot messages
        # 2. Registration info
        # 3. Staff category id
        # 4. Staff info channel id
    except Exception as exception:
        raise HTTPException(status_code=500, detail=str(exception))


@router.put("/settings/language")
@uniform_response_middleware
async def select_server_language(request_body: RegistrationRequestBody = Body(...)):
    try:
        pass
        # Set language in server config json file
    except Exception as exception:
        raise HTTPException(status_code=500, detail=str(exception))


@router.post("/settings/registration")
@uniform_response_middleware
async def create_registration_message(request_body: RegistrationRequestBody = Body(...)):
    try:
        channel_id = request_body.channel_id

        if not channel_id:
            channel_name = request_body.channel_name
            channel = await create_text_registration_channel(channel_name)
            channel_id = channel.id

        await send_registration_message(channel_id)
    except disnake.errors.HTTPException as exception:
        raise HTTPException(status_code=exception.status, detail=str(exception.text))
    except Exception as exception:
        raise HTTPException(status_code=500, detail=str(exception))


@router.post("/settings/staff/category")
@uniform_response_middleware
async def create_staff_category(request_body: StaffCategoryRequestBody = Body(...)):
    try:
        category_id = request_body.category_id
        if category_id and not await check_if_category_exists(category_id):
            # Set category id to config as Staff category id
            pass
        else:
            # Get language and based on it name for the staff category
            name = ""

            await create_staff_category(name)
    except disnake.errors.HTTPException as exception:
        raise HTTPException(status_code=exception.status, detail=str(exception.text))
    except ValueError as exception:
        raise HTTPException(status_code=400, detail=str(exception))
    except Exception as exception:
        raise HTTPException(status_code=500, detail=str(exception))


@router.post("/settings/staff/info")
@uniform_response_middleware
async def create_staff_info_message(request_body: RegistrationRequestBody = Body(...)):
    try:
        channel_id = request_body.channel_id

        if not channel_id:
            pass
            # channel = await create_staff_info_channel(channel_name)
            # channel_id = channel.id
        else:
            pass
            # Get staff

        # await send_staff_info_message(channel_id)
    except disnake.errors.HTTPException as exception:
        raise HTTPException(status_code=exception.status, detail=str(exception.text))
    except Exception as exception:
        raise HTTPException(status_code=500, detail=str(exception))
