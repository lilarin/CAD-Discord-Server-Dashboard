import disnake
from fastapi import APIRouter, HTTPException, Body

from backend.middlewares.uniform_response import uniform_response_middleware
from backend.schemas import Role, NameRequestBody, User
from backend.services.fetch import fetch_role, fetch_users_with_role
from backend.services.format import (
    format_editable_roles_response,
    format_non_editable_roles_response,
    format_users_with_role_response
)
from backend.utils.role import (
    create_target_role,
    rename_target_role,
    delete_target_role
)

router = APIRouter()


@router.get("/roles", response_model=list[Role])
@uniform_response_middleware
async def get_roles():
    try:
        return await format_non_editable_roles_response()
    except disnake.errors.HTTPException as exception:
        raise HTTPException(status_code=exception.status, detail=str(exception.text))
    except Exception as exception:
        raise HTTPException(status_code=500, detail=str(exception))


@router.get("/roles/editable", response_model=list[Role])
@uniform_response_middleware
async def get_editable_roles():
    try:
        return await format_editable_roles_response()
    except disnake.errors.HTTPException as exception:
        raise HTTPException(status_code=exception.status, detail=str(exception.text))
    except Exception as exception:
        raise HTTPException(status_code=500, detail=str(exception))


@router.post("/roles", response_model=list[Role])
@uniform_response_middleware
async def create_role(request_body: NameRequestBody = Body(...)):
    try:
        name = request_body.name
        await create_target_role(name)
        return await format_editable_roles_response()
    except disnake.errors.HTTPException as exception:
        raise HTTPException(status_code=exception.status, detail=str(exception.text))
    except Exception as exception:
        raise HTTPException(status_code=500, detail=str(exception))


@router.patch("/roles/{role_id}", response_model=list[Role])
@uniform_response_middleware
async def rename_role(role_id: int, request_body: NameRequestBody = Body(...)):
    try:
        role = await fetch_role(role_id)
        await rename_target_role(role, request_body.name)
        return await format_editable_roles_response()
    except disnake.errors.HTTPException as exception:
        raise HTTPException(status_code=exception.status, detail=str(exception.text))
    except Exception as exception:
        raise HTTPException(status_code=500, detail=str(exception))


@router.delete("/roles/{role_id}", response_model=list[Role])
@uniform_response_middleware
async def delete_role(role_id: int):
    try:
        role = await fetch_role(role_id)
        await delete_target_role(role)
        return await format_editable_roles_response()
    except disnake.errors.HTTPException as exception:
        raise HTTPException(status_code=exception.status, detail=str(exception.text))
    except Exception as exception:
        raise HTTPException(status_code=500, detail=str(exception))


@router.get("/roles/{role_id}", response_model=list[User])
@uniform_response_middleware
async def get_role_holders(role_id: int):
    try:
        users = await fetch_users_with_role(role_id)
        return await format_users_with_role_response(users)
    except disnake.errors.HTTPException as exception:
        raise HTTPException(status_code=exception.status, detail=str(exception.text))
    except Exception as exception:
        raise HTTPException(status_code=500, detail=str(exception))
