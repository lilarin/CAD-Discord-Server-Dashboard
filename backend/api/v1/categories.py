import disnake
from fastapi import APIRouter, HTTPException, Body

from backend.middlewares.uniform_response import uniform_response_middleware
from backend.schemas import Category, Role
from backend.services.requests import update_channel_order
from backend.services.fetch import (
    fetch_channel,
    fetch_channels_by_type,
    fetch_roles_with_access,
    fetch_roles_by_ids
)
from backend.services.format import (
    format_categories_response,
    format_base_channel_response,
    format_roles_with_access_response,
    format_roles_response
)
from backend.services.utils import (
    create_template_category,
    delete_target_category, rename_target_channel
)

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


@router.patch("/categories/{channel_id}/rename/{name}", response_model=list[Category])
@uniform_response_middleware
async def rename_channel(channel_id: int, name: str):
    try:
        channel = await fetch_channel(channel_id)
        if channel.type not in [disnake.ChannelType.category]:
            raise ValueError("Incorrect channel type")

        if channel.name.lower() == name.lower():
            raise ValueError("Name cannot be the same")

        await rename_target_channel(channel, name)
        return await format_categories_response()
    except disnake.errors.HTTPException as exception:
        raise HTTPException(status_code=exception.status, detail=str(exception.text))
    except ValueError as exception:
        raise HTTPException(status_code=400, detail=str(exception))
    except Exception as exception:
        raise HTTPException(status_code=500, detail=str(exception))


@router.post("/categories/{name}", response_model=list[Category])
@uniform_response_middleware
async def create_category(name: str):
    try:
        await create_template_category(name)
        return await format_categories_response()
    except disnake.errors.HTTPException as exception:
        raise HTTPException(status_code=exception.status, detail=str(exception.text))
    except ValueError as exception:
        raise HTTPException(status_code=400, detail=str(exception))
    except Exception as exception:
        raise HTTPException(status_code=500, detail=str(exception))


@router.patch("/categories/{category_id}/position/{position_id}", response_model=list[Category])
@uniform_response_middleware
async def reorder_category_position(category_id: int, position_id: int):
    try:
        channel = await fetch_channel(category_id)
        if channel.type != disnake.ChannelType.category:
            raise ValueError("Incorrect channel type")

        channels = await fetch_channels_by_type(channel.type)
        channels.sort(key=lambda c: (c.position, c.id))

        channels.remove(channel)
        channels.insert(position_id, channel)

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

        for role in await actual_roles_with_access:
            if role not in fetched_roles_with_access:
                await category.set_permissions(role, overwrite=None)

        permissions_overwrites = {}
        for role in fetched_roles_with_access:
            permissions_overwrites[role] = disnake.PermissionOverwrite(view_channel=True)

        if permissions_overwrites is not None:
            await category.edit(overwrites=permissions_overwrites)

        return await format_roles_response(fetched_roles_with_access)
    except disnake.errors.HTTPException as exception:
        raise HTTPException(status_code=exception.status, detail=str(exception.text))
    except ValueError as exception:
        raise HTTPException(status_code=400, detail=str(exception))
    except Exception as exception:
        raise HTTPException(status_code=500, detail=str(exception))
