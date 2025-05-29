import disnake
from fastapi import APIRouter, HTTPException, Body

from backend.config import translation
from backend.middlewares.uniform_response import uniform_response_middleware
from backend.schemas import (
    RegistrationRequestBody,
    ServerConfig,
    StaffCategoryRequestBody,
    ServerLanguageRequestBody
)
from backend.services.server_config import server_config
from backend.utils.categories import create_staff_category
from backend.utils.channels import (
    create_text_registration_channel,
    check_channel_in_category,
    create_staff_info_channel
)
from backend.utils.messages import send_staff_info_message
from backend.utils.registration import send_registration_message
from backend.utils.validation import check_category_exists

router = APIRouter()


@router.get("/settings/config", response_model=ServerConfig)
@uniform_response_middleware
async def get_server_config():
    try:
        return await server_config.get_validated_config()
    except disnake.errors.HTTPException as exception:
        raise HTTPException(status_code=exception.status, detail=str(exception.text))
    except Exception as exception:
        raise HTTPException(status_code=500, detail=str(exception))


@router.put("/settings/language")
@uniform_response_middleware
async def select_server_language(request_body: ServerLanguageRequestBody = Body(...)):
    try:
        language = request_body.language.lower()

        config = await server_config.get_config()
        config.language = language

        await server_config.update_config(config)

    except ValueError as exception:
        raise HTTPException(status_code=400, detail=str(exception))
    except Exception as exception:
        raise HTTPException(status_code=500, detail=str(exception))


@router.post("/settings/registration")
@uniform_response_middleware
async def create_registration_message(request_body: RegistrationRequestBody = Body(...)):
    try:
        config = await server_config.get_config()
        channel_id = request_body.channel_id

        if not channel_id:
            name = translation.translate("registration.channel_name", config.language)
            channel = await create_text_registration_channel(name)
            channel_id = channel.id

        message_id = await send_registration_message(channel_id)
        config.registration.channel_id = str(channel_id)
        config.registration.message_id = str(message_id)

        await server_config.update_config(config)

    except disnake.errors.HTTPException as exception:
        raise HTTPException(status_code=exception.status, detail=str(exception.text))
    except Exception as exception:
        raise HTTPException(status_code=500, detail=str(exception))


@router.post("/settings/staff/category")
@uniform_response_middleware
async def set_staff_category(request_body: StaffCategoryRequestBody = Body(...)):
    try:
        config = await server_config.get_config()
        category_id = request_body.category_id

        if category_id:
            if not await check_category_exists(int(category_id)):
                raise HTTPException(status_code=404, detail="Category not found")

            config.staff.category_id = category_id
            config.staff.channel_id = None
            config.staff.message_id = None

        else:
            name = translation.translate("staff.category_name", config.language)
            category = await create_staff_category(name)
            config.staff.category_id = str(category.id)
            config.staff.channel_id = None
            config.staff.message_id = None

        await server_config.update_config(config)

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
        config = await server_config.get_config()
        category_id = config.staff.category_id
        channel_id = request_body.channel_id

        if not channel_id:
            name = translation.translate("staff.channel_name", config.language)
            channel = await create_staff_info_channel(name, int(category_id))
            channel_id = channel.id
        else:
            if await check_channel_in_category(int(category_id), int(channel_id)):
                raise HTTPException(status_code=404, detail="Channel not found")

        message_id = await send_staff_info_message(int(channel_id))

        config.staff.channel_id = str(channel_id)
        config.staff.message_id = str(message_id)

        await server_config.update_config(config)

    except disnake.errors.HTTPException as exception:
        raise HTTPException(status_code=exception.status, detail=str(exception.text))
    except HTTPException as exception:
        raise HTTPException(status_code=exception.status_code, detail=str(exception.detail))
    except Exception as exception:
        raise HTTPException(status_code=500, detail=str(exception))
