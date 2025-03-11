from disnake import (
    CategoryChannel,
    VoiceChannel,
    TextChannel,
    PermissionOverwrite
)

from backend.config import config
from backend.services.fetch import (
    fetch_guild,
    fetch_guild_default_role,
    fetch_role,
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
