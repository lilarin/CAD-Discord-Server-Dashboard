import disnake
from fastapi import APIRouter, HTTPException

from backend.middlewares.uniform_response import uniform_response_middleware
from backend.schemas import RoleWithAccess, Category
from backend.services.requests import update_channel_order
from backend.services.fetch import fetch_channel, fetch_channels_by_type
from backend.services.format import (
    format_categories_response,
    format_base_channel_response
)
from backend.services.utils import (
    create_template_category,
    delete_target_category
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
    except disnake.errors.HTTPException as exception:
        raise HTTPException(status_code=exception.status, detail=str(exception.text))
    except ValueError as exception:
        raise HTTPException(status_code=400, detail=str(exception))
    except Exception as exception:
        raise HTTPException(status_code=500, detail=str(exception))


@router.get("/categories/{category_id}")
@uniform_response_middleware
async def get_category_permissions(category_id: int) -> list[RoleWithAccess]:
    try:
        category = await fetch_channel(category_id)
        if not isinstance(category, disnake.CategoryChannel):
            raise ValueError("Incorrect channel type, expected category")

        roles_with_view_access = [
            RoleWithAccess(
                id=target.id,
                name=target.name
            )
            for target, permissions in category.overwrites.items()
            if isinstance(target, disnake.Role) and permissions.view_channel is True
        ]
        return roles_with_view_access
    except disnake.errors.HTTPException as exception:
        raise HTTPException(status_code=exception.status, detail=str(exception.text))
    except ValueError as exception:
        raise HTTPException(status_code=400, detail=str(exception))
    except Exception as exception:
        raise HTTPException(status_code=500, detail=str(exception))


@router.patch("/categories/{category_id}", deprecated=True)
@uniform_response_middleware
async def edit_category_permissions(category_id: int) -> list[RoleWithAccess]:
    try:
        pass
        # category = await fetch_channel(category_id)
        # if not isinstance(category, disnake.CategoryChannel):
        #     raise ValueError("Incorrect channel type, expected category")
        #
        # roles_with_view_access = [
        #     RoleWithAccess(
        #         id=target.id,
        #         name=target.name
        #     )
        #     for target, permissions in category.overwrites.items()
        #     if isinstance(target, disnake.Role) and permissions.view_channel is True
        # ]
        # return roles_with_view_access
    except disnake.errors.HTTPException as exception:
        raise HTTPException(status_code=exception.status, detail=str(exception.text))
    except ValueError as exception:
        raise HTTPException(status_code=400, detail=str(exception))
    except Exception as exception:
        raise HTTPException(status_code=500, detail=str(exception))
