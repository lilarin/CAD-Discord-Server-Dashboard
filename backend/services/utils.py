from datetime import datetime

from disnake import (
    CategoryChannel,
    VoiceChannel,
    TextChannel,
    PermissionOverwrite,
    Role,
    Member
)

from backend.config import config
from backend.services.fetch import (
    fetch_guild,
    fetch_guild_default_role,
    fetch_role,
    fetch_channel,
    fetch_channels_by_category
)
from backend.services.bot_ui import (
    init_queue_buttons,
    create_queue_message_embed
)


async def create_template_category(category_name) -> CategoryChannel:
    guild = await fetch_guild()
    everyone_role = await fetch_guild_default_role()
    teacher_role = await fetch_role(config.teacher_role)
    administrator_role = await fetch_role(config.administrator_role)

    default_overwrites = {
        everyone_role: PermissionOverwrite(view_channel=False),
        teacher_role: PermissionOverwrite(view_channel=True),
        administrator_role: PermissionOverwrite(view_channel=True)
    }

    category = await guild.create_category(name=category_name, overwrites=default_overwrites)
    return category


async def create_text_target_channel(category: CategoryChannel, name: str) -> TextChannel:
    guild = await fetch_guild()
    return await guild.create_text_channel(name=name, category=category)


async def create_voice_target_channel(category: CategoryChannel, name: str) -> VoiceChannel:
    guild = await fetch_guild()
    return await guild.create_voice_channel(name=name, category=category)


async def rename_target_channel(
        channel: VoiceChannel | TextChannel | CategoryChannel, name: str
) -> VoiceChannel | TextChannel | CategoryChannel:
    return await channel.edit(name=name)


async def delete_target_channel(channel: VoiceChannel | TextChannel) -> None:
    await channel.delete()


async def delete_target_category(category) -> None:
    for channel in await fetch_channels_by_category(category):
        await channel.delete()
    await category.delete()


async def sync_permissions_with_category(channel_id: id) -> VoiceChannel | TextChannel:
    channel = await fetch_channel(channel_id)
    await channel.edit(sync_permissions=True)
    return channel


async def create_target_role(role_name: str) -> Role:
    guild = await fetch_guild()
    return await guild.create_role(name=role_name)


async def rename_target_role(role: Role, role_name: str) -> Role:
    return await role.edit(name=role_name)


async def delete_target_role(role: Role) -> None:
    await role.delete()


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


async def create_queue_message(
        channel_id: str,
        title: str,
        event_time: str,
) -> None:
    channel = await fetch_channel(int(channel_id))
    timestamp = datetime.fromisoformat(event_time)

    embed = await create_queue_message_embed(title, timestamp)
    action_row = await init_queue_buttons()

    await channel.send(embed=embed, components=action_row)
