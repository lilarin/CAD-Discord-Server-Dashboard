from typing import List

import disnake
from fastapi import APIRouter, HTTPException

from backend.middlewares.uniform_response import uniform_response_middleware
from backend.schemas import Channel, BaseChannel
from backend.services.fetch import fetch_channels, fetch_channel
from backend.services.requests import update_channel_order

router = APIRouter()


@router.get("/categories", response_model=List[Channel])
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
            if channel.type == disnake.ChannelType.category
        ]
        return categories
    except disnake.errors.HTTPException as exception:
        raise HTTPException(status_code=exception.status, detail=str(exception.text))
    except Exception as exception:
        raise HTTPException(status_code=500, detail=str(exception))


@router.patch("/categories/{category_id}/position/{position_id}", response_model=List[Channel])
@uniform_response_middleware
async def reorder_channel_position(category_id: int, position_id: int):
    try:
        target_channel = await fetch_channel(category_id)

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
        ]

        await update_channel_order(payload)


        channels = [
            Channel(
                id=str(channel.id),
                name=channel.name,
                position=channel.position,
            )
            for channel in await fetch_channels()
            if channel.type == disnake.ChannelType.category
        ]
        return channels
    except disnake.errors.HTTPException as exception:
        raise HTTPException(status_code=exception.status, detail=str(exception.text))
    except Exception as exception:
        raise HTTPException(status_code=500, detail=str(exception))