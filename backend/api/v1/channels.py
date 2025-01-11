from typing import List

from fastapi import APIRouter, HTTPException

from backend.middlewares.uniform_response import uniform_response_middleware
from backend.schemas import Channel
from backend.services.fetch import fetch_channels

router = APIRouter()


@router.get("/channels/{category_id}", response_model=List[Channel])
@uniform_response_middleware
async def get_channels_by_category_id(category_id: int):
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
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))
