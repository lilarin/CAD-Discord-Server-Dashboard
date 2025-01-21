import disnake
from disnake import CategoryChannel, VoiceChannel, TextChannel

from backend.schemas import Channel, BaseChannel, Category, Role
from backend.services.fetch import fetch_channels, fetch_roles_with_access


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


async def format_roles_with_access_response(category: CategoryChannel) -> list[Role]:
    return [
        Role(
            id=str(target.id),
            name=target.name
        )
        for target in await fetch_roles_with_access(category)
    ]


async def format_roles_with_access_by_roles(roles) -> list[Role]:
    return [
        Role(
            id=str(target.id),
            name=target.name
        )
        for target in roles
    ]


async def format_base_channel_response(channel: TextChannel | VoiceChannel, index: int) -> BaseChannel:
    return BaseChannel(
        id=str(channel.id),
        position=index,
    )
