from disnake import (
    CategoryChannel,
    VoiceChannel,
    TextChannel,
    PermissionOverwrite
)

from backend.config import config
from backend.services.fetch import fetch_channels_by_category
from backend.services.fetch import (
    fetch_guild,
    fetch_guild_default_role,
    fetch_role,
    fetch_channel
)


async def create_template_category(category_name: str) -> CategoryChannel:
    guild = await fetch_guild()
    everyone_role = await fetch_guild_default_role()
    administrator_role = await fetch_role(config.administrator_role_id)

    default_overwrites = {
        everyone_role: PermissionOverwrite(view_channel=False),
        administrator_role: PermissionOverwrite(view_channel=True)
    }

    category = await guild.create_category(name=category_name, overwrites=default_overwrites)
    return category


async def create_staff_category(category_name: str) -> CategoryChannel:
    guild = await fetch_guild()
    everyone_role = await fetch_guild_default_role()
    teacher_role = await fetch_role(config.teacher_role_id)
    administrator_role = await fetch_role(config.administrator_role_id)

    default_overwrites = {
        everyone_role: PermissionOverwrite(view_channel=False),
        teacher_role: PermissionOverwrite(view_channel=True),
        administrator_role: PermissionOverwrite(view_channel=True)
    }

    category = await guild.create_category(name=category_name, overwrites=default_overwrites)
    return category


async def delete_target_category(category: CategoryChannel) -> None:
    for channel in await fetch_channels_by_category(category):
        await channel.delete()
    await category.delete()


async def sync_permissions_with_category(channel_id: int) -> VoiceChannel | TextChannel:
    channel = await fetch_channel(channel_id)
    await channel.edit(sync_permissions=True)
    return channel


async def check_category_exists(category_id: int) -> bool:
    return await fetch_channel(category_id) is not None
