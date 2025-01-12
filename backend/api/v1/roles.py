import disnake
from fastapi import APIRouter, HTTPException

from backend.middlewares.uniform_response import uniform_response_middleware
from backend.schemas import Role
from backend.services.fetch import fetch_roles, fetch_guild_default_role

router = APIRouter()


@router.get("/roles", response_model=list[Role])
@uniform_response_middleware
async def get_roles():
    try:
        default_role = await fetch_guild_default_role()
        roles = [
            Role(id=str(role.id), name=role.name)
            for role in await fetch_roles()
            if role != default_role
        ]
        roles.sort(key=lambda user: user.name)
        return roles
    except disnake.errors.HTTPException as exception:
        raise HTTPException(status_code=exception.status, detail=str(exception.text))
    except Exception as exception:
        raise HTTPException(status_code=500, detail=str(exception))
