import disnake
from disnake import CategoryChannel
from fastapi import APIRouter, HTTPException

from backend.middlewares.uniform_response import uniform_response_middleware
from backend.schemas import Channel, BaseChannel
from backend.services.fetch import fetch_channels, fetch_channel, fetch_formatted_categories, fetch_channels_by_type
from backend.services.requests import update_channel_order
from backend.services.utils import create_template_category, delete_target_category

router = APIRouter()


@router.get("/categories", response_model=list[Channel])
@uniform_response_middleware
async def get_categories():
    try:
        categories = [
            Channel(
                id=str(channel.id),
                name=channel.name,
                position=channel.position,
            )
            for channel in await fetch_channels()
            if channel.type == CategoryChannel
        ]
        return categories
    except disnake.errors.HTTPException as exception:
        raise HTTPException(status_code=exception.status, detail=str(exception.text))
    except Exception as exception:
        raise HTTPException(status_code=500, detail=str(exception))


@router.patch("/categories/{category_id}/position/{position_id}", response_model=list[Channel])
@uniform_response_middleware
async def reorder_category_position(category_id: int, position_id: int):
    try:
        channel = await fetch_channel(category_id)
        if channel.type != CategoryChannel:
            raise ValueError("Incorrect channel type")

        channels = await fetch_channels_by_type(channel.type)
        channels.sort(key=lambda c: (c.position, c.id))

        channels.remove(channel)
        channels.insert(position_id, channel)

        payload = [
            BaseChannel(
                id=str(channel.id),
                position=index
            )
            for index, channel in enumerate(channels)
        ]

        await update_channel_order(payload)

        return await fetch_formatted_categories()
    except disnake.errors.HTTPException as exception:
        raise HTTPException(status_code=exception.status, detail=str(exception.text))
    except ValueError as exception:
        raise HTTPException(status_code=400, detail=str(exception))
    except Exception as exception:
        raise HTTPException(status_code=500, detail=str(exception))


@router.post("/categories/{name}", response_model=list[Channel])
@uniform_response_middleware
async def create_category(name: str):
    try:
        await create_template_category(name)
        return await fetch_formatted_categories()
    except disnake.errors.HTTPException as exception:
        raise HTTPException(status_code=exception.status, detail=str(exception.text))
    except ValueError as exception:
        raise HTTPException(status_code=400, detail=str(exception))
    except Exception as exception:
        raise HTTPException(status_code=500, detail=str(exception))


@router.delete("/categories/{category_id}", response_model=list[Channel])
@uniform_response_middleware
async def delete_category(category_id: int):
    try:
        channel = await fetch_channel(category_id)
        if channel.type != CategoryChannel:
            raise ValueError("Incorrect channel type")

        await delete_target_category(channel)
    except disnake.errors.HTTPException as exception:
        raise HTTPException(status_code=exception.status, detail=str(exception.text))
    except ValueError as exception:
        raise HTTPException(status_code=400, detail=str(exception))
    except Exception as exception:
        raise HTTPException(status_code=500, detail=str(exception))
