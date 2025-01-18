from disnake import Role, Member, VoiceChannel, TextChannel, CategoryChannel, Guild

from backend.common.variables import variables
from backend.services.bot import bot


async def fetch_guild() -> Guild:
    return await bot.fetch_guild(variables.GUILD_ID)


async def fetch_channels() -> list[VoiceChannel | TextChannel | CategoryChannel]:
    guild = await fetch_guild()
    channels_sequence = await guild.fetch_channels()
    channels = list(channels_sequence)
    channels.sort(key=lambda c: (c.position, c.id))
    return channels


async def fetch_channels_by_type(
        channel_type: VoiceChannel | TextChannel | CategoryChannel
) -> list[VoiceChannel | TextChannel | CategoryChannel]:
    guild = await fetch_guild()
    channels_sequence = [
        channel for channel in await guild.fetch_channels()
        if channel.type == channel_type
    ]
    channels = list(channels_sequence)
    channels.sort(key=lambda c: (c.position, c.id))
    return channels


async def fetch_channels_by_category(category: CategoryChannel) -> list[TextChannel | VoiceChannel]:
    return [
        channel for channel in await fetch_channels()
        if channel.category_id == category.id
    ]


async def fetch_channel(channel_id: int) -> VoiceChannel | TextChannel | CategoryChannel:
    guild = await fetch_guild()
    channel = await guild.fetch_channel(channel_id)
    return channel


async def fetch_users() -> list[Member]:
    guild = await fetch_guild()
    members = await guild.fetch_members().flatten()
    return members


async def fetch_roles() -> list[Role]:
    guild = await fetch_guild()
    roles = await guild.fetch_roles()
    return roles


async def fetch_role(role_id: int) -> Role:
    guild = await fetch_guild()
    role = await guild.fetch_role(role_id)
    return role


async def fetch_guild_default_role() -> Role:
    guild = await fetch_guild()
    return guild.default_role
