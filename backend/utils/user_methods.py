from disnake import Member

from backend.config import config
from backend.services.fetch import fetch_guild


async def rename_target_user(user: Member, name: str) -> Member:
    return await user.edit(nick=name)


async def kick_target_user(user: Member) -> None:
    guild = await fetch_guild()
    await guild.kick(user)


async def get_user_group(user: Member) -> str | None:
    for role in user.roles:
        if role.id == config.teacher_role_id or role.id == config.administrator_role_id:
            return "staff"
        elif role.id == config.student_role_id:
            return "student"
