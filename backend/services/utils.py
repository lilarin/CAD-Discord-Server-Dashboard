from disnake import CategoryChannel, VoiceChannel, TextChannel, PermissionOverwrite

from backend.common.variables import variables
from backend.services.fetch import (
    fetch_guild,
    fetch_guild_default_role,
    fetch_role,
    fetch_channel,
    fetch_channels_by_category
)


async def create_template_category(category_name) -> CategoryChannel:
    guild = await fetch_guild()
    everyone_role = await fetch_guild_default_role()
    teacher_role = await fetch_role(variables.TEACHER_ROLE_ID)
    administrator_role = await fetch_role(variables.ADMINISTRATOR_ROLE_ID)

    default_overwrites = {
        everyone_role: PermissionOverwrite(view_channel=False),
        teacher_role: PermissionOverwrite(view_channel=True),
        administrator_role: PermissionOverwrite(view_channel=True)
    }

    category = await guild.create_category(name=category_name, overwrites=default_overwrites)
    return category


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