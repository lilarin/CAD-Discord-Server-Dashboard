from backend.schemas import Role
from backend.services.fetch import fetch_guild


async def create_target_role(role_name: str) -> Role:
    guild = await fetch_guild()
    return await guild.create_role(name=role_name)


async def rename_target_role(role: Role, role_name: str) -> Role:
    return await role.edit(name=role_name)


async def delete_target_role(role: Role) -> None:
    await role.delete()
