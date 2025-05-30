import disnake
from disnake import PermissionOverwrite
from fastapi import APIRouter, HTTPException, Body

from backend.middlewares.uniform_response import uniform_response_middleware
from backend.schemas import Category, Role, NameRequestBody, PositionRequestBody
from backend.services.fetch import (
    fetch_channel,
    fetch_channels_by_type,
    fetch_roles_with_access,
    fetch_roles_by_ids, fetch_guild_default_role
)
from backend.services.format import (
    format_categories_response,
    format_base_channel_response,
    format_roles_with_access_response,
    format_roles_response
)
from backend.utils.categories import delete_target_category, create_template_category
from backend.utils.channels import rename_target_channel
from backend.utils.reorder_request import update_channel_order

router = APIRouter()


@router.get("/categories", response_model=list[Category])
@uniform_response_middleware
async def get_categories():
    try:
        return await format_categories_response()
    except disnake.errors.HTTPException as exception:
        raise HTTPException(status_code=exception.status, detail=str(exception.text))
    except Exception as exception:
        raise HTTPException(status_code=500, detail=str(exception))


@router.patch("/categories/{category_id}", response_model=list[Category])
@uniform_response_middleware
async def rename_category(category_id: int, request_body: NameRequestBody = Body(...)):
    try:
        channel = await fetch_channel(category_id)
        if channel.type not in [disnake.ChannelType.category]:
            raise ValueError("Incorrect channel type")

        if channel.name.lower() == request_body.name.lower():
            raise ValueError("Name cannot be the same")

        await rename_target_channel(channel, request_body.name)
        return await format_categories_response()
    except disnake.errors.HTTPException as exception:
        raise HTTPException(status_code=exception.status, detail=str(exception.text))
    except ValueError as exception:
        raise HTTPException(status_code=400, detail=str(exception))
    except Exception as exception:
        raise HTTPException(status_code=500, detail=str(exception))


@router.post("/categories", response_model=list[Category])
@uniform_response_middleware
async def create_category(request_body: NameRequestBody = Body(...)):
    try:
        name = request_body.name
        await create_template_category(name)
        return await format_categories_response()
    except disnake.errors.HTTPException as exception:
        raise HTTPException(status_code=exception.status, detail=str(exception.text))
    except ValueError as exception:
        raise HTTPException(status_code=400, detail=str(exception))
    except Exception as exception:
        raise HTTPException(status_code=500, detail=str(exception))


@router.patch("/categories/{category_id}/reorder", response_model=list[Category])
@uniform_response_middleware
async def reorder_category_position(category_id: int, request_body: PositionRequestBody = Body(...)):
    try:
        channel = await fetch_channel(category_id)
        if channel.type != disnake.ChannelType.category:
            raise ValueError("Incorrect channel type")

        channels = await fetch_channels_by_type(channel.type)
        channels.sort(key=lambda c: (c.position, c.id))

        channels.remove(channel)
        channels.insert(request_body.position, channel)

        payload = [
            await format_base_channel_response(channel, ch_index)
            for ch_index, channel in enumerate(channels)
        ]

        await update_channel_order(payload)

        return await format_categories_response()
    except disnake.errors.HTTPException as exception:
        raise HTTPException(status_code=exception.status, detail=str(exception.text))
    except ValueError as exception:
        raise HTTPException(status_code=400, detail=str(exception))
    except Exception as exception:
        raise HTTPException(status_code=500, detail=str(exception))


@router.delete("/categories/{category_id}", response_model=list[Category])
@uniform_response_middleware
async def delete_category(category_id: int):
    try:
        channel = await fetch_channel(category_id)
        if channel.type != disnake.ChannelType.category:
            raise ValueError("Incorrect channel type")

        await delete_target_category(channel)
        return await format_categories_response()
    except disnake.errors.HTTPException as exception:
        raise HTTPException(status_code=exception.status, detail=str(exception.text))
    except ValueError as exception:
        raise HTTPException(status_code=400, detail=str(exception))
    except Exception as exception:
        raise HTTPException(status_code=500, detail=str(exception))


@router.get("/categories/{category_id}/permissions", response_model=list[Role])
@uniform_response_middleware
async def get_category_permissions(category_id: int):
    try:
        category = await fetch_channel(category_id)
        if not isinstance(category, disnake.CategoryChannel):
            raise ValueError("Incorrect channel type, expected category")

        return await format_roles_with_access_response(category)
    except disnake.errors.HTTPException as exception:
        raise HTTPException(status_code=exception.status, detail=str(exception.text))
    except ValueError as exception:
        raise HTTPException(status_code=400, detail=str(exception))
    except Exception as exception:
        raise HTTPException(status_code=500, detail=str(exception))


@router.put("/categories/{category_id}/permissions", response_model=list[Role])
@uniform_response_middleware
async def edit_category_permissions(category_id: int, roles_with_access: list[str] = Body(...)):
    try:
        category = await fetch_channel(category_id)
        if not isinstance(category, disnake.CategoryChannel):
            raise ValueError("Incorrect channel type, expected category")

        try:
            fetched_roles_with_access = await fetch_roles_by_ids(roles_with_access)
        except disnake.errors.HTTPException:
            raise ValueError("Incorrect object in roles")

        actual_roles_with_access = fetch_roles_with_access(category)

        everyone_role = await fetch_guild_default_role()

        permissions_overwrites_to_remove = {}
        permissions_overwrites_to_add = {
            everyone_role: PermissionOverwrite(
                view_channel=False,
                create_instant_invite=False,
                read_message_history=True,
            ),
        }

        for role in await actual_roles_with_access:
            if role not in fetched_roles_with_access:
                permissions_overwrites_to_remove[role] = PermissionOverwrite()
        await category.edit(overwrites=permissions_overwrites_to_remove)

        for role in fetched_roles_with_access:
            permissions_overwrites_to_add[role] = PermissionOverwrite(view_channel=True)
        await category.edit(overwrites=permissions_overwrites_to_add)

        return await format_roles_response(fetched_roles_with_access)
    except disnake.errors.HTTPException as exception:
        raise HTTPException(status_code=exception.status, detail=str(exception.text))
    except ValueError as exception:
        raise HTTPException(status_code=400, detail=str(exception))
    except Exception as exception:
        raise HTTPException(status_code=500, detail=str(exception))
