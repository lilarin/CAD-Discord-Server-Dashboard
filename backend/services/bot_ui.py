from datetime import datetime

import disnake

from backend.config import config
from backend.utils.response import send_ephemeral_response
from backend.services.users_registration import add_registration_user, check_user_name


async def init_register_buttons() -> disnake.ui.ActionRow:
    register = disnake.ui.Button(
        style=disnake.ButtonStyle.primary,
        label="📑 Зареєструватись",
        custom_id="register_button",
    )
    inactive = disnake.ui.Button(
        style=disnake.ButtonStyle.grey,
        label="👨‍🎓 Щоб пройти ідентифікацію на сервері",
        custom_id="inactive_button",
        disabled=True,
    )
    return disnake.ui.ActionRow(register, inactive)


async def create_registration_embed():
    embed = disnake.Embed(
        title="Кафедра Системного Проєктування ІПСА",
        description=(
            "Щоб отримати доступ до серверу необхідно пройти реєстрацію. "
            "Натисніть на кнопку під повідомленням та дотримуйтесь інструкцій\n"
            "-# Викладачам достатньо першого пункту, вказати прізвище та ім'я"
        ),
        color=0xFFFFFF,
    )
    embed.set_image(url="https://imgur.com/uG2M5wK.png")
    return embed


async def init_queue_buttons(leave_disabled: bool = True, switch_disabled: bool = True) -> disnake.ui.ActionRow:
    join = disnake.ui.Button(
        style=disnake.ButtonStyle.primary,
        label="🚀 Записатись",
        custom_id="join_queue_button",
    )
    leave = disnake.ui.Button(
        style=disnake.ButtonStyle.grey,
        label="👋 Вийти",
        custom_id="leave_queue_button",
        disabled=leave_disabled,
    )
    switch_places = disnake.ui.Button(
        style=disnake.ButtonStyle.grey,
        label="🔄 Помінятись місцями",
        custom_id="switch_queue_places_button",
        disabled=switch_disabled,
    )
    return disnake.ui.ActionRow(join, leave, switch_places)


async def init_staff_info_message_buttons() -> disnake.ui.ActionRow:
    open_dashboard = disnake.ui.Button(
        style=disnake.ButtonStyle.link,
        label="💻 Перейти до веб-панелі",
        url=config.frontend_url
    )
    return disnake.ui.ActionRow(open_dashboard)


async def create_staff_info_message_embed():
    embed = disnake.Embed(
        title="Інформація",
        description=(
            "Для полегшення керування навчальним процесом існує Веб-панель для викладачів.\n"
            "Інформація щодо використання панелі знаходиться на головній її сторінці.\n"
            "Щоб відкрити панелі в браузері - натисніть на кнопку-посилання під цим \n"
            "повідомленням та авторизуйтесь використовуючи свій Discord акаунт."
        ),
        color=0xFFFFFF
    )
    return embed



async def create_queue_message_embed(title: str, timestamp: datetime):
    embed = disnake.Embed(
        title=title,
        color=0xFFFFFF,
        timestamp=timestamp,
    )
    embed.add_field("", "-# Черга порожня")
    embed.set_footer(text="Початок")
    return embed


async def init_name_confirm_button() -> disnake.ui.ActionRow:
    name_confirm = disnake.ui.Button(
        style=disnake.ButtonStyle.primary,
        label="✔️ Так, продовжити далі",
        custom_id="name_confirm_button",
    )
    return disnake.ui.ActionRow(name_confirm)


async def init_switch_accept_button(disabled: bool = False):
    style = disnake.ButtonStyle.grey if disabled else disnake.ButtonStyle.green
    label = "Запит схвалено" if disabled else "✔️ Схвалити запит"

    accept = disnake.ui.Button(
        style=style,
        label=label,
        custom_id="accept_switch_button",
        disabled=disabled,
    )
    return disnake.ui.ActionRow(accept)


async def create_switch_accepted_embed(jump_url: str):
    embed = disnake.Embed(
        description=f"Ваш запит на обмін місцями у черзі {jump_url} схвалено",
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
    group_confirm = disnake.ui.Button(
        style=disnake.ButtonStyle.green,
        label="✔️ Так, завершити реєстрацію",
        custom_id="group_confirm_button",
    )
    return disnake.ui.ActionRow(group_confirm)


class RegisterModal(disnake.ui.Modal):
    def __init__(self, user: disnake.User) -> None:
        components = [
            disnake.ui.TextInput(
                label="Введіть ваше прізвище та ім'я українською",
                placeholder="Кракович Павло",
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

        await send_ephemeral_response(
            interaction,
            f"Ви ввели: \n"
            f"### {name} \n "
            f"Чи підтверджуєте правильність вводу?\n"
            f"-# Ваше ім'я буде змінено на введене",
            components=await init_name_confirm_button()
        )
