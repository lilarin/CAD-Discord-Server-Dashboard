from backend.common.variables import variables
from backend.services.bot import bot


async def fetch_guild():
    return await bot.fetch_guild(variables.GUILD_ID)

async def fetch_channels():
    guild = await fetch_guild()
    channels = await guild.fetch_channels()
    return sorted(channels, key=lambda ch: ch.position)

async def fetch_users():
    guild = await fetch_guild()
    members = await guild.fetch_members().flatten()
    return members

async def fetch_guild_default_role():
    guild = await fetch_guild()
    return guild.default_role
