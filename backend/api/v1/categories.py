from typing import List

import disnake
from fastapi import APIRouter, HTTPException

from backend.middlewares.uniform_response import uniform_response_middleware
from backend.schemas import Category
from backend.services.fetch import fetch_channels

router = APIRouter()


@router.get("/categories", response_model=List[Category])
@uniform_response_middleware
async def get_categories():
    try:
        categories = [
            Category(
                id=str(channel.id),
                name=channel.name,
                position=channel.position,
            )
            for channel in await fetch_channels()
            if channel.type == disnake.ChannelType.category
        ]
        return categories
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))
