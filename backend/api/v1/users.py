import disnake
from fastapi import APIRouter, HTTPException

from backend.middlewares.uniform_response import uniform_response_middleware
from backend.schemas import User
from backend.services.fetch import fetch_users, fetch_role

router = APIRouter()


@router.get("/users/", response_model=list[User])
@uniform_response_middleware
async def get_users():
    try:
        users = [
            User(id=str(member.id), name=member.display_name)
            for member in await fetch_users()
        ]
        users.sort(key=lambda user: user.name)
        return users
    except disnake.errors.HTTPException as exception:
        raise HTTPException(status_code=exception.status, detail=str(exception.text))
    except Exception as exception:
        raise HTTPException(status_code=500, detail=str(exception))


@router.get("/users/roles/{role_id}", response_model=list[User])
@uniform_response_middleware
async def get_users_by_role(role_id: int):
    try:
        role = await fetch_role(role_id)
        users = [
            User(id=str(member.id), name=member.display_name)
            for member in await fetch_users()
            if role in member.roles
        ]
        users.sort(key=lambda user: user.name)
        return users
    except disnake.errors.HTTPException as exception:
        raise HTTPException(status_code=exception.status, detail=str(exception.text))
    except Exception as exception:
        raise HTTPException(status_code=500, detail=str(exception))

