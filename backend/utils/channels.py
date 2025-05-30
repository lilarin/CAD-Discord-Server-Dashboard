from disnake import (
    CategoryChannel,
    VoiceChannel,
    TextChannel, PermissionOverwrite
)

from backend.config import config
from backend.services.fetch import (
    fetch_guild,
    fetch_channel,
    fetch_guild_default_role,
    fetch_role,
)


async def create_text_registration_channel(name: str) -> TextChannel:
    guild = await fetch_guild()
    everyone_role = await fetch_guild_default_role()
    teacher_role = await fetch_role(config.teacher_role_id)
    student_role = await fetch_role(config.student_role_id)

    default_overwrites = {
        everyone_role: PermissionOverwrite(
            view_channel=True,
            read_message_history=True,
            send_messages=False,
            add_reactions=False,
            create_instant_invite=False,
            create_private_threads=False,
            create_public_threads=False,
        ),
        teacher_role: PermissionOverwrite(view_channel=False),
        student_role: PermissionOverwrite(view_channel=False),
    }

    return await guild.create_text_channel(name=name, overwrites=default_overwrites)


async def create_staff_info_channel(name: str, category_id: int) -> TextChannel:
    guild = await fetch_guild()
    category = await fetch_channel(category_id)
    return await guild.create_text_channel(name=name, category=category, position=0)


async def create_text_target_channel(category: CategoryChannel, name: str) -> TextChannel:
    guild = await fetch_guild()
    channel = await guild.create_text_channel(name=name, category=category)
    return channel


async def create_voice_target_channel(category: CategoryChannel, name: str) -> VoiceChannel:
    guild = await fetch_guild()
    channel = await guild.create_voice_channel(name=name, category=category)
    return channel


async def rename_target_channel(
        channel: VoiceChannel | TextChannel | CategoryChannel, name: str
) -> VoiceChannel | TextChannel | CategoryChannel:
    return await channel.edit(name=name)


async def delete_target_channel(channel: VoiceChannel | TextChannel) -> None:
    await channel.delete()


async def check_channel_in_category(category_id: int, channel_id: int, channel: TextChannel | VoiceChannel = None) -> bool:
    if channel_id == category_id:
        return False

    if not channel:
        channel = await fetch_channel(channel_id)

    return channel or channel.category_id == category_id


async def check_channel_exists(channel_id: int) -> bool:
    channel = await fetch_channel(channel_id)
    return bool(channel)
