from datetime import datetime

import disnake

from backend.config import config, translation
from backend.services.server_config import server_config
from backend.services.users_registration import add_registration_user, check_user_name
from backend.utils.response import send_ephemeral_response


async def init_register_buttons() -> disnake.ui.ActionRow:
    language = await server_config.get_language()
    register = disnake.ui.Button(
        style=disnake.ButtonStyle.primary,
        label=await translation.translate("registration.register_button", language),
        custom_id="register_button",
    )
    inactive = disnake.ui.Button(
        style=disnake.ButtonStyle.grey,
        label=await translation.translate("registration.inactive_button", language),
        custom_id="inactive_button",
        disabled=True,
    )
    return disnake.ui.ActionRow(register, inactive)


async def create_registration_embed():
    language = await server_config.get_language()
    embed = disnake.Embed(
        description=await translation.translate("registration.description", language),
        color=0xFFFFFF,
    )
    embed.set_image(url=config.registration_embed_image_url)
    return embed


async def init_queue_buttons(leave_disabled: bool = True, switch_disabled: bool = True) -> disnake.ui.ActionRow:
    language = await server_config.get_language()
    join = disnake.ui.Button(
        style=disnake.ButtonStyle.primary,
        label=await translation.translate("queue.join_queue_button", language),
        custom_id="join_queue_button",
    )
    leave = disnake.ui.Button(
        style=disnake.ButtonStyle.grey,
        label=await translation.translate("queue.leave_queue_button", language),
        custom_id="leave_queue_button",
        disabled=leave_disabled,
    )
    switch_places = disnake.ui.Button(
        style=disnake.ButtonStyle.grey,
        label=await translation.translate("queue.switch_queue_places_button", language),
        custom_id="switch_queue_places_button",
        disabled=switch_disabled,
    )
    return disnake.ui.ActionRow(join, leave, switch_places)


async def init_staff_info_message_button() -> disnake.ui.ActionRow:
    language = await server_config.get_language()
    open_dashboard = disnake.ui.Button(
        style=disnake.ButtonStyle.link,
        label=await translation.translate("staff.info_message_button", language),
        url=config.frontend_url
    )
    return disnake.ui.ActionRow(open_dashboard)


async def create_staff_info_message_embed():
    language = await server_config.get_language()
    embed = disnake.Embed(
        title=await translation.translate("staff.title", language),
        description=await translation.translate("staff.description", language),
        color=0xFFFFFF
    )
    return embed


async def create_queue_message_embed(title: str, timestamp: datetime):
    language = await server_config.get_language()
    embed = disnake.Embed(
        title=title,
        color=0xFFFFFF,
        timestamp=timestamp,
    )
    embed.add_field("", await translation.translate("queue.empty_field", language))
    embed.set_footer(text=await translation.translate("queue.footer_text", language))
    return embed


async def init_name_confirm_button() -> disnake.ui.ActionRow:
    language = await server_config.get_language()
    name_confirm = disnake.ui.Button(
        style=disnake.ButtonStyle.primary,
        label=await translation.translate("registration.name_confirm_button", language),
        custom_id="name_confirm_button",
    )
    return disnake.ui.ActionRow(name_confirm)


async def init_switch_accept_button(disabled: bool = False):
    language = await server_config.get_language()
    style = disnake.ButtonStyle.grey if disabled else disnake.ButtonStyle.green

    if disabled:
        label = await translation.translate("registration.accepted_button", language)
    else:
        label = await translation.translate("registration.accept_button", language)

    accept = disnake.ui.Button(
        style=style,
        label=label,
        custom_id="accept_switch_button",
        disabled=disabled,
    )
    return disnake.ui.ActionRow(accept)


async def create_switch_accepted_embed(jump_url: str):
    language = await server_config.get_language()
    description = await translation.translate("registration.accepted_embed_description", language)
    description = description.format(jump_url=jump_url)
    embed = disnake.Embed(
        description=description,
        color=0xFFFFFF,
    )
    return embed


async def init_group_select(roles) -> disnake.ui.ActionRow:
    options = [
        disnake.SelectOption(
            label=role.name,
            value=str(role.id)
        ) for role in roles if not role.is_default() and "-" in role.name
    ]
    role_select = disnake.ui.Select(
        placeholder="...",
        options=options,
        custom_id="role_select_option"
    )
    return disnake.ui.ActionRow(role_select)


async def init_user_select(users, message_id) -> disnake.ui.ActionRow:
    options = [
        disnake.SelectOption(
            label=user.display_name,
            value=f"{user.id} {message_id}"
        ) for user in users
    ]
    user_select = disnake.ui.Select(
        placeholder="...",
        options=options,
        custom_id="user_select_option"
    )
    return disnake.ui.ActionRow(user_select)


async def init_group_confirm_button() -> disnake.ui.ActionRow:
    language = await server_config.get_language()
    group_confirm = disnake.ui.Button(
        style=disnake.ButtonStyle.green,
        label=await translation.translate("registration.group_confirm_button", language),
        custom_id="group_confirm_button",
    )
    return disnake.ui.ActionRow(group_confirm)


class RegisterModal(disnake.ui.Modal):
    def __init__(self, user: disnake.User, label: str, placeholder: str) -> None:
        components = [
            disnake.ui.TextInput(
                label=label,
                placeholder=placeholder,
                custom_id="name",
                style=disnake.TextInputStyle.single_line,
                max_length=300,
            ),
        ]
        super().__init__(
            title="",
            custom_id="registerModal",
            components=components,
        )
        self.user = user

    async def callback(self, interaction: disnake.ModalInteraction) -> None:
        name = interaction.text_values["name"]
        if not await check_user_name(interaction, name):
            return

        await add_registration_user(interaction.user.id, name)

        language = await server_config.get_language()
        message = await translation.translate("registration.registration_confirm", language)
        message = message.format(name=name)

        await send_ephemeral_response(
            interaction,
            message,
            components=await init_name_confirm_button()
        )
