from disnake import Member

from backend.config import config
from backend.services.fetch import fetch_guild, fetch_user_roles_ids


async def rename_target_user(user: Member, name: str) -> Member:
    return await user.edit(nick=name)


async def kick_target_user(user: Member) -> None:
    guild = await fetch_guild()
    await guild.kick(user)


async def get_user_group(user: Member, owner_id: int = None) -> tuple[str | None, bool]:
    if not owner_id:
        guild = await fetch_guild()
        owner_id = guild.owner_id

    roles_ids = await fetch_user_roles_ids(user)
    if config.administrator_role_id in roles_ids or user.id == owner_id:
        return "staff", True
    elif config.teacher_role_id in roles_ids:
        return "staff", False
    elif config.student_role_id in roles_ids:
        return "student", False
    return None, False
