from disnake import (
    CategoryChannel,
    VoiceChannel,
    TextChannel
)

from backend.services.fetch import (
    fetch_guild,
    fetch_channel,
)


async def create_text_registration_channel(name: str) -> TextChannel:
    guild = await fetch_guild()
    return await guild.create_text_channel(name=name, position=0)


async def create_staff_info_channel(name: str, category_id: int) -> TextChannel:
    guild = await fetch_guild()
    category = await fetch_channel(category_id)
    return await guild.create_text_channel(name=name, category=category, position=0)


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


async def check_channel_in_category(category_id: int, channel_id: int) -> bool:
    if channel_id == category_id:
        return False

    channel = await fetch_channel(channel_id)
    return channel or channel.category_id == category_id


async def check_channel_exists(channel_id: int) -> bool:
    channel = await fetch_channel(channel_id)
    return bool(channel)
