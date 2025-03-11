import disnake
from fastapi import APIRouter, HTTPException, Body

from backend.middlewares.uniform_response import uniform_response_middleware
from backend.schemas import User, NameRequestBody
from backend.services.fetch import fetch_roles_by_ids, fetch_user, fetch_user_roles, fetch_guild_default_role
from backend.services.format import format_users_response, format_roles_response, format_user_response
from backend.utils.user import kick_target_user, rename_target_user

router = APIRouter()


@router.get("/users", response_model=list[User])
@uniform_response_middleware
async def get_users():
    try:
        return await format_users_response()
    except disnake.errors.HTTPException as exception:
        raise HTTPException(status_code=exception.status, detail=str(exception.text))
    except Exception as exception:
        raise HTTPException(status_code=500, detail=str(exception))


@router.patch("/users/{user_id}", response_model=list[User])
@uniform_response_middleware
async def rename_user(user_id: int, request_body: NameRequestBody = Body(...)):
    try:
        user = await fetch_user(user_id)
        await rename_target_user(user, request_body.name)
        return await format_users_response()
    except disnake.errors.HTTPException as exception:
        raise HTTPException(status_code=exception.status, detail=str(exception.text))
    except Exception as exception:
        raise HTTPException(status_code=500, detail=str(exception))


@router.get("/users/{user_id}", response_model=list[User])
@uniform_response_middleware
async def get_user_by_id(user_id: int):
    try:
        user = await fetch_user(user_id)
        return await format_user_response(user)
    except disnake.errors.HTTPException as exception:
        raise HTTPException(status_code=exception.status, detail=str(exception.text))
    except Exception as exception:
        raise HTTPException(status_code=500, detail=str(exception))


@router.get("/users/{user_id}/roles", response_model=list[User])
@uniform_response_middleware
async def get_user_roles(user_id: int):
    try:
        user = await fetch_user(user_id)
        roles = await fetch_user_roles(user)
        return await format_roles_response(roles)
    except disnake.errors.HTTPException as exception:
        raise HTTPException(status_code=exception.status, detail=str(exception.text))
    except Exception as exception:
        raise HTTPException(status_code=500, detail=str(exception))


@router.put("/users/{user_id}", response_model=list[User])
@uniform_response_middleware
async def change_user_roles(user_id: int, roles: list[str] = Body(...)):
    try:
        try:
            new_roles = await fetch_roles_by_ids(roles)
        except disnake.errors.HTTPException:
            raise ValueError("Incorrect object in roles")

        user = await fetch_user(user_id)
        actual_roles = await fetch_user_roles(user)

        default_role = await fetch_guild_default_role()
        for role in actual_roles:
            if role not in new_roles and role != default_role:
                await user.remove_roles(role)

        for role in new_roles:
            await user.add_roles(role)

        return await format_users_response()
    except disnake.errors.HTTPException as exception:
        raise HTTPException(status_code=exception.status, detail=str(exception.text))
    except Exception as exception:
        raise HTTPException(status_code=500, detail=str(exception))


@router.delete("/users/{user_id}", response_model=list[User])
@uniform_response_middleware
async def kick_user(user_id: int):
    try:
        user = await fetch_user(user_id)
        await kick_target_user(user)
        return await format_users_response()
    except disnake.errors.HTTPException as exception:
        raise HTTPException(status_code=exception.status, detail=str(exception.text))
    except Exception as exception:
        raise HTTPException(status_code=500, detail=str(exception))
