import disnake
from disnake import CategoryChannel, VoiceChannel, TextChannel

from backend.schemas import Channel, BaseChannel, Category
from backend.services.fetch import fetch_channels


async def format_categories_response() -> list[Category]:
    return [
        Category(
            id=str(channel.id),
            name=channel.name,
            position=channel.position,
        )
        for channel in await fetch_channels()
        if channel.type == disnake.ChannelType.category
    ]


async def format_channels_by_category_response(category: CategoryChannel) -> list[Channel]:
    channels = [
        Channel(
            id=str(channel.id),
            name=channel.name,
            position=channel.position,
            type=channel.type.name,
        )
        for channel in await fetch_channels()
        if channel.category_id == category.id
    ]
    channels.sort(key=lambda channel: (channel.type != 'text', channel.position))
    return channels


async def format_base_channel_response(channel: TextChannel | VoiceChannel, index: int) -> BaseChannel:
    return BaseChannel(
        id=str(channel.id),
        position=index,
    )


async def format_channel_response(channel: TextChannel | VoiceChannel) -> Channel:
    return Channel(
        id=str(channel.id),
        name=channel.name,
        position=channel.position,
    )
