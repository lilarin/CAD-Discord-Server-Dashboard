import re
from dataclasses import dataclass

import disnake

from backend.services.responses import send_ephemeral_response


USER_REGISTER_DATA = {}


@dataclass
class UserRegistrationData:
    full_name: str
    role: disnake.Role = None


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


async def init_name_confirm_button() -> disnake.ui.ActionRow:
    name_confirm = disnake.ui.Button(
        style=disnake.ButtonStyle.primary,
        label="✔️ Так, продовжити далі",
        custom_id="name_confirm_button",
    )
    return disnake.ui.ActionRow(name_confirm)


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
        match_patter = r"[А-Яа-яЄєІіЇїҐґ'’\s-]+"
        if not re.fullmatch(match_patter, name) or " " not in name:
            await send_ephemeral_response(
                interaction,
                "Введені дані повинні містити "
                "тільки кирилицю, пробіли або апостроф."
            )
            return

        USER_REGISTER_DATA[interaction.user.id] = UserRegistrationData(full_name=name)

        await send_ephemeral_response(
            interaction,
            f"Ви ввели: \n"
            f"### {name} \n "
            f"Чи підтверджуєте правильність вводу?\n"
            f"-# Ваше ім'я буде змінене на введене",
            components=await init_name_confirm_button()
        )
