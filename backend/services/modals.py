import re
from dataclasses import dataclass

import disnake

from backend.services.responses import send_ephemeral_response
from backend.services.utils import init_name_confirm_button


USER_REGISTER_DATA = {}


@dataclass
class UserRegistrationData:
    full_name: str
    role: disnake.Role = None


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
