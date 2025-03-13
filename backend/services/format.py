import disnake
from disnake import CategoryChannel, VoiceChannel, TextChannel, Member

from backend.config import config
from backend.schemas import Channel, BaseChannel, Category, Role, User
from backend.services.fetch import (
    fetch_channels,
    fetch_roles_with_access,
    fetch_guild_default_role,
    fetch_roles,
    fetch_users,
    fetch_role,
    fetch_guild,
)
from backend.utils.user import get_user_group


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
    channels.sort(key=lambda channel: (channel.type != "text", channel.position))
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
        if role != default_role and not role.is_bot_managed()
    ]
    roles = sorted(roles, key=lambda role: (
        0 if int(role.id) == config.teacher_role_id else
        1 if int(role.id) == config.student_role_id else
        2,
        role.name.lower()
    ))

    return roles


async def format_editable_roles_response() -> list[Role]:
    default_role = await fetch_guild_default_role()
    excluded_roles_ids = [
        default_role.id,
        config.administrator_role_id,
        config.teacher_role_id,
        config.student_role_id,
    ]
    roles = [
        Role(
            id=str(role.id),
            name=role.name
        )
        for role in await fetch_roles()
        if (
            role.id not in excluded_roles_ids and not role.is_bot_managed()
        )
    ]
    roles = sorted(roles, key=lambda role: role.name.lower())

    return roles


async def format_users_response() -> list[User]:
    guild = await fetch_guild()
    users = []
    for member in await fetch_users():
        user_group, is_admin = await get_user_group(member, guild.owner_id)
        users.append(
            User(
                id=str(member.id),
                name=member.display_name,
                group=user_group,
                is_admin=is_admin
            )
        )
    users.sort(key=lambda user: user.name)
    return users


async def format_base_users_response() -> list[User]:
    filter_roles_ids = [
        config.administrator_role_id,
        config.teacher_role_id,
        config.student_role_id,
    ]
    filter_roles = [
        await fetch_role(role_id) for role_id in filter_roles_ids
    ]

    users = []
    for member in await fetch_users():
        if any(role in filter_roles for role in member.roles):
            users.append(
                User(
                    id=str(member.id),
                    name=member.display_name
                )
            )
    users.sort(key=lambda user: user.name)
    return users


async def format_user_response(user: Member) -> User:
    user_group, is_admin = await get_user_group(user)
    return User(
        id=str(user.id),
        name=user.display_name,
        group=user_group,
        is_admin=is_admin
    )


async def format_users_with_role_response(users: list[Member]) -> list[User]:
    return [
        User(
            id=str(user.id),
            name=user.display_name
        )
        for user in users
    ]
