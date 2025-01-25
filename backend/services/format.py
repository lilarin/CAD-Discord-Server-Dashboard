import disnake
from disnake import CategoryChannel, VoiceChannel, TextChannel

from backend.common.variables import variables
from backend.schemas import Channel, BaseChannel, Category, Role, User
from backend.services.fetch import (
    fetch_channels,
    fetch_roles_with_access,
    fetch_guild_default_role,
    fetch_roles,
    fetch_users
)


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


async def format_roles_response(roles) -> list[Role]:
    default_role = await fetch_guild_default_role()
    return [
        Role(
            id=str(role.id),
            name=role.name
        )
        for role in roles
        if role != default_role
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


async def format_users_response() -> list[User]:
    users = []
    for member in await fetch_users():
        user_type = None
        for role in member.roles:
            if role.id == variables.TEACHER_ROLE_ID or role.id == variables.ADMINISTRATOR_ROLE_ID:
                user_type = "staff"
                break
            elif role.id == variables.STUDENT_ROLE_ID:
                user_type = "student"
                break
        users.append(
            User(
                id=str(member.id),
                name=member.display_name,
                group=user_type
            )
        )
    users.sort(key=lambda user: user.name)
    return users
