import disnake
from fastapi import APIRouter, HTTPException

from backend.middlewares.uniform_response import uniform_response_middleware
from backend.schemas import Channel
from backend.services.requests import update_channel_order
from backend.services.fetch import (
    fetch_channel,
    fetch_channels_by_type
)
from backend.services.format import (
    format_channels_by_category_response,
    format_base_channel_response
)
from backend.services.utils import (
    delete_target_channel,
    create_voice_target_channel,
    rename_target_channel,
    create_text_target_channel
)

router = APIRouter()


@router.get("/channels/{category_id}", response_model=list[Channel])
@uniform_response_middleware
async def get_channels_by_category_id(category_id: int):
    try:
        channel = await fetch_channel(category_id)
        if channel.type != disnake.ChannelType.category:
            raise ValueError("Incorrect channel type")

        return await format_channels_by_category_response(channel)
    except disnake.errors.HTTPException as exception:
        raise HTTPException(status_code=exception.status, detail=str(exception.text))
    except ValueError as exception:
        raise HTTPException(status_code=400, detail=str(exception))
    except Exception as exception:
        raise HTTPException(status_code=500, detail=str(exception))


@router.patch("/channels/{channel_id}/rename/{name}", response_model=list[Channel])
@uniform_response_middleware
async def rename_channel(channel_id: int, name: str):
    try:
        channel = await fetch_channel(channel_id)
        if channel.type not in [disnake.ChannelType.text, disnake.ChannelType.voice]:
            raise ValueError("Incorrect channel type")

        if channel.name.lower() == name.lower():
            raise ValueError("Name cannot be the same")

        await rename_target_channel(channel, name)
        category = await fetch_channel(channel.category_id)
        return await format_channels_by_category_response(category)
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
        if channel.type not in [disnake.ChannelType.text, disnake.ChannelType.voice]:
            raise ValueError("Incorrect channel type")

        category = await fetch_channel(channel.category_id)

        channels = await fetch_channels_by_type(channel.type)
        channels.sort(key=lambda c: (c.position, c.id))

        channels.remove(channel)
        channels.insert(position_id, channel)

        payload = [
            await format_base_channel_response(channel, ch_index)
            for ch_index, channel in enumerate(channels)
            if channel.category_id == category.id
        ]
        await update_channel_order(payload)

        return await format_channels_by_category_response(category)
    except disnake.errors.HTTPException as exception:
        raise HTTPException(status_code=exception.status, detail=str(exception.text))
    except ValueError as exception:
        raise HTTPException(status_code=400, detail=str(exception))
    except Exception as exception:
        raise HTTPException(status_code=500, detail=str(exception))


@router.post("/channels/{category_id}/channel_name/{name}/text", response_model=list[Channel])
@uniform_response_middleware
async def create_text_channel(category_id: int, name: str):
    try:
        channel = await fetch_channel(category_id)
        if channel.type != disnake.ChannelType.category:
            raise ValueError("Incorrect channel type")

        await create_text_target_channel(channel, name)
        return await format_channels_by_category_response(channel)
    except disnake.errors.HTTPException as exception:
        raise HTTPException(status_code=exception.status, detail=str(exception.text))
    except ValueError as exception:
        raise HTTPException(status_code=400, detail=str(exception))
    except Exception as exception:
        raise HTTPException(status_code=500, detail=str(exception))


@router.post("/channels/{category_id}/channel_name/{name}/voice", response_model=list[Channel])
@uniform_response_middleware
async def create_voice_channel(category_id: int, name: str):
    try:
        channel = await fetch_channel(category_id)
        if channel.type != disnake.ChannelType.category:
            raise ValueError("Incorrect channel type")

        await create_voice_target_channel(channel, name)
        return await format_channels_by_category_response(channel)
    except disnake.errors.HTTPException as exception:
        raise HTTPException(status_code=exception.status, detail=str(exception.text))
    except ValueError as exception:
        raise HTTPException(status_code=400, detail=str(exception))
    except Exception as exception:
        raise HTTPException(status_code=500, detail=str(exception))


@router.delete("/channels/{channel_id}", response_model=list[Channel])
@uniform_response_middleware
async def delete_channel(channel_id: int):
    try:
        channel = await fetch_channel(channel_id)
        if channel.type not in [disnake.ChannelType.text, disnake.ChannelType.voice]:
            raise ValueError("Incorrect channel type")

        await delete_target_channel(channel)
        category = await fetch_channel(channel.category_id)
        return await format_channels_by_category_response(category)
    except disnake.errors.HTTPException as exception:
        raise HTTPException(status_code=exception.status, detail=str(exception.text))
    except ValueError as exception:
        raise HTTPException(status_code=400, detail=str(exception))
    except Exception as exception:
        raise HTTPException(status_code=500, detail=str(exception))


@router.get("/channels/{channel_id}", response_model=list[Channel], deprecated=True)
@uniform_response_middleware
async def get_channel_permissions(channel_id: int):
    try:
        pass
    except disnake.errors.HTTPException as exception:
        raise HTTPException(status_code=exception.status, detail=str(exception.text))
    except ValueError as exception:
        raise HTTPException(status_code=400, detail=str(exception))
    except Exception as exception:
        raise HTTPException(status_code=500, detail=str(exception))


@router.patch("/channels/{channel_id}", response_model=list[Channel], deprecated=True)
@uniform_response_middleware
async def edit_channel_permissions(channel_id: int):
    try:
        channel = await fetch_channel(channel_id)
        if channel.type not in [disnake.ChannelType.text, disnake.ChannelType.voice]:
            raise ValueError("Incorrect channel type")

        pass
    except disnake.errors.HTTPException as exception:
        raise HTTPException(status_code=exception.status, detail=str(exception.text))
    except ValueError as exception:
        raise HTTPException(status_code=400, detail=str(exception))
    except Exception as exception:
        raise HTTPException(status_code=500, detail=str(exception))


@router.patch("/channels/{channel_id}/sync", response_model=list[Channel], deprecated=True)
@uniform_response_middleware
async def sync_channel_permissions(channel_id: int):
    try:
        channel = await fetch_channel(channel_id)
        if channel.type not in [disnake.ChannelType.text, disnake.ChannelType.voice]:
            raise ValueError("Incorrect channel type")

        return
    except disnake.errors.HTTPException as exception:
        raise HTTPException(status_code=exception.status, detail=str(exception.text))
    except ValueError as exception:
        raise HTTPException(status_code=400, detail=str(exception))
    except Exception as exception:
        raise HTTPException(status_code=500, detail=str(exception))
