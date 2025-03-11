from disnake import VoiceChannel, TextChannel

from backend.services.fetch import fetch_channels_by_category, fetch_channel


async def delete_target_category(category) -> None:
    for channel in await fetch_channels_by_category(category):
        await channel.delete()
    await category.delete()


async def sync_permissions_with_category(channel_id: id) -> VoiceChannel | TextChannel:
    channel = await fetch_channel(channel_id)
    await channel.edit(sync_permissions=True)
    return channel
