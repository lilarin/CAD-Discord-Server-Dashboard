import re
from dataclasses import dataclass

import disnake

from backend.utils.response import send_ephemeral_response

USER_REGISTER_DATA = {}


@dataclass
class UserRegistrationData:
    full_name: str
    role: disnake.Role = None


async def get_registration_user_info(interaction: disnake.MessageInteraction) -> UserRegistrationData | None:
    user_info = USER_REGISTER_DATA.get(interaction.user.id)

    if user_info:
        return user_info

    await send_ephemeral_response(
        interaction,
        "Будь ласка, розпочніть реєстрацію заново, стара форма вже не дійсна"
    )


async def add_registration_user(user_id: int, name: str) -> None:
    USER_REGISTER_DATA[user_id] = UserRegistrationData(full_name=name)


async def remove_registration_user(user_id: int) -> None:
    USER_REGISTER_DATA.pop(user_id)


async def check_user_name(interaction: disnake.ModalInteraction, name: str) -> bool:
    match_patter = r"[А-Яа-яЄєІіЇїҐґ'’\s-]+"
    if not re.fullmatch(match_patter, name) or " " not in name:
        await send_ephemeral_response(
            interaction,
            "Введені дані повинні містити тільки кирилицю, пробіли або апостроф"
        )
        return False
    return True
