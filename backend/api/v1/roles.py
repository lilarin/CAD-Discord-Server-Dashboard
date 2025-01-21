import disnake
from fastapi import APIRouter, HTTPException

from backend.common.variables import variables
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
            Role(
                id=str(role.id),
                name=role.name
            )
            for role in await fetch_roles()
            if role != default_role and role.id != variables.ADMINISTRATOR_ROLE_ID
        ]
        roles = sorted(roles, key=lambda role: (
            0 if int(role.id) == variables.TEACHER_ROLE_ID else
            1 if int(role.id) == variables.STUDENT_ROLE_ID else
            2,
            role.name.lower()
        ))

        return roles
    except disnake.errors.HTTPException as exception:
        raise HTTPException(status_code=exception.status, detail=str(exception.text))
    except Exception as exception:
        raise HTTPException(status_code=500, detail=str(exception))
