from typing import List

import disnake.errors
from fastapi import APIRouter, HTTPException

from backend.middlewares.uniform_response import uniform_response_middleware
from backend.schemas import Channel, BaseChannel
from backend.services.fetch import fetch_channels, fetch_channel
from backend.services.requests import update_channel_order

router = APIRouter()


async def fetch_category_channels(category_id: int):
    try:
        channels = [
            Channel(
                id=str(channel.id),
                name=channel.name,
                position=channel.position,
            )
            for channel in await fetch_channels()
            if channel.category_id == category_id
        ]
        return channels
    except Exception:
        raise


@router.get("/channels/{category_id}", response_model=List[Channel])
@uniform_response_middleware
async def get_channels_by_category_id(category_id: int):
    try:
        return await fetch_category_channels(category_id)
    except disnake.errors.HTTPException as exception:
        raise HTTPException(status_code=exception.status, detail=str(exception.text))
    except Exception as exception:
        raise HTTPException(status_code=500, detail=str(exception))


@router.get("/channels", response_model=List[BaseChannel])
@uniform_response_middleware
async def get_channels():
    try:
        channels = [
            BaseChannel(
                id=str(channel.id),
                position=channel.position,
            )
            for channel in await fetch_channels()
        ]
        return channels
    except disnake.errors.HTTPException as exception:
        raise HTTPException(status_code=exception.status, detail=str(exception.text))
    except Exception as exception:
        raise HTTPException(status_code=500, detail=str(exception))


@router.patch("/channels/{channel_id}/position/{position_id}", response_model=List[Channel])
@uniform_response_middleware
async def reorder_channel_position(channel_id: int, position_id: int):
    try:
        target_channel = await fetch_channel(channel_id)
        category_id = target_channel.category_id

        channels = [
            channel for channel in await fetch_channels()
            if channel.type == target_channel.type
        ]
        channels.sort(key=lambda c: (c.position, c.id))

        channels.remove(target_channel)
        channels.insert(position_id, target_channel)

        payload = [
            BaseChannel(
                id=str(channel.id),
                position=index
            )
            for index, channel in enumerate(channels)
            if channel.category_id == category_id
        ]

        await update_channel_order(payload)

        return await fetch_category_channels(category_id)
    except disnake.errors.HTTPException as exception:
        raise HTTPException(status_code=exception.status, detail=str(exception.text))
    except Exception as exception:
        raise HTTPException(status_code=500, detail=str(exception))