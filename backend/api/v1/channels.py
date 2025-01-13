import disnake
from disnake import CategoryChannel, TextChannel, VoiceChannel
from fastapi import APIRouter, HTTPException

from backend.middlewares.schemas import ResponseWrapper
from backend.middlewares.uniform_response import uniform_response_middleware
from backend.schemas import Channel, BaseChannel
from backend.services.fetch import fetch_channel, fetch_formatted_channels_by_category, fetch_channels_by_type
from backend.services.requests import update_channel_order
from backend.services.utils import rename_target_channel, delete_target_channel

router = APIRouter()


@router.get("/channels/{category_id}", response_model=list[Channel])
@uniform_response_middleware
async def get_channels_by_category_id(category_id: int):
    try:
        channel = await fetch_channel(category_id)
        if channel.type != CategoryChannel:
            raise ValueError("Incorrect channel type")

        return await fetch_formatted_channels_by_category(channel)
    except disnake.errors.HTTPException as exception:
        raise HTTPException(status_code=exception.status, detail=str(exception.text))
    except ValueError as exception:
        raise HTTPException(status_code=400, detail=str(exception))
    except Exception as exception:
        raise HTTPException(status_code=500, detail=str(exception))


@router.patch("/channels/{channel_id}/position/{position_id}", response_model=list[Channel])
@uniform_response_middleware
async def reorder_channel_position(channel_id: int, position_id: int):
    try:
        channel = await fetch_channel(channel_id)
        if channel.type not in [TextChannel, VoiceChannel]:
            raise ValueError("Incorrect channel type")

        category = await fetch_channel(channel.category_id)

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
            if channel.category_id == category.id
        ]
        await update_channel_order(payload)

        return await fetch_formatted_channels_by_category(category)
    except disnake.errors.HTTPException as exception:
        raise HTTPException(status_code=exception.status, detail=str(exception.text))
    except ValueError as exception:
        raise HTTPException(status_code=400, detail=str(exception))
    except Exception as exception:
        raise HTTPException(status_code=500, detail=str(exception))


@router.delete("/channels/{channel_id}", response_model=ResponseWrapper)
@uniform_response_middleware
async def delete_channel(channel_id: int):
    try:
        channel = await fetch_channel(channel_id)
        if channel.type not in [TextChannel, VoiceChannel]:
            raise ValueError("Incorrect channel type")

        await delete_target_channel(channel)
    except disnake.errors.HTTPException as exception:
        raise HTTPException(status_code=exception.status, detail=str(exception.text))
    except ValueError as exception:
        raise HTTPException(status_code=400, detail=str(exception))
    except Exception as exception:
        raise HTTPException(status_code=500, detail=str(exception))


@router.patch("/channels/{channel_id}/rename/{name}", response_model=Channel)
@uniform_response_middleware
async def rename_channel(channel_id: int, name: str):
    try:
        channel = await fetch_channel(channel_id)
        if channel.type not in [TextChannel, VoiceChannel]:
            raise ValueError("Incorrect channel type")

        channel = await rename_target_channel(channel, name)
        return Channel(
            id=str(channel_id),
            position=channel.position,
            name=channel.name
        )
    except disnake.errors.HTTPException as exception:
        raise HTTPException(status_code=exception.status, detail=str(exception.text))
    except ValueError as exception:
        raise HTTPException(status_code=400, detail=str(exception))
    except Exception as exception:
        raise HTTPException(status_code=500, detail=str(exception))
