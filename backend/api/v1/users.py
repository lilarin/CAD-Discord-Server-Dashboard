from typing import List

from fastapi import APIRouter, HTTPException

from backend.middlewares.uniform_response import uniform_response_middleware
from backend.schemas import User
from backend.services.fetch import fetch_users

router = APIRouter()


@router.get("/users/", response_model=List[User])
@uniform_response_middleware
async def get_users():
    try:
        users = [
            User(id=str(member.id), name=member.display_name)
            for member in await fetch_users()
        ]
        users.sort(key=lambda user: user.name)
        return users
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))