from disnake import Member

from backend.config import config
from backend.services.fetch import fetch_guild, fetch_user_roles_ids


async def rename_target_user(user: Member, name: str) -> Member:
    return await user.edit(nick=name)


async def kick_target_user(user: Member) -> None:
    guild = await fetch_guild()
    await guild.kick(user)


async def get_user_group(user: Member) -> tuple[str, bool]:
    guild = await fetch_guild()
    roles_ids = await fetch_user_roles_ids(user)
    if config.administrator_role_id in roles_ids or user.id == guild.owner_id:
        return "staff", True
    elif config.teacher_role_id in roles_ids:
        return "staff", False
    elif config.student_role_id in roles_ids:
        return "student", False
