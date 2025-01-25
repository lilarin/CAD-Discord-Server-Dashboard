import disnake
from disnake import CategoryChannel, VoiceChannel, TextChannel

from backend.common.variables import variables
from backend.schemas import Channel, BaseChannel, Category, Role
from backend.services.fetch import fetch_channels, fetch_roles_with_access, fetch_guild_default_role, fetch_roles


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


async def format_non_editable_roles_response() -> list[Role]:
    default_role = await fetch_guild_default_role()
    roles = [
        Role(
            id=str(role.id),
            name=role.name
        )
        for role in await fetch_roles()
        if role != default_role
    ]
    roles = sorted(roles, key=lambda role: (
        0 if int(role.id) == variables.TEACHER_ROLE_ID else
        1 if int(role.id) == variables.STUDENT_ROLE_ID else
        2,
        role.name.lower()
    ))

    return roles


async def format_editable_roles_response() -> list[Role]:
    default_role = await fetch_guild_default_role()
    roles = [
        Role(
            id=str(role.id),
            name=role.name
        )
        for role in await fetch_roles()
        if role != default_role and role.id != variables.ADMINISTRATOR_ROLE_ID and
           role.id != variables.TEACHER_ROLE_ID and role.id != variables.STUDENT_ROLE_ID
    ]
    roles = sorted(roles, key=lambda role: role.name.lower())

    return roles