import regex
from dataclasses import dataclass

import disnake

from backend.config import translation
from backend.services.server_config import server_config
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

    language = await server_config.get_language()

    await send_ephemeral_response(
        interaction,
        message=await translation.translate("registration.registration_form_outdated_message", language)
    )


async def add_registration_user(user_id: int, name: str) -> None:
    USER_REGISTER_DATA[user_id] = UserRegistrationData(full_name=name)


async def remove_registration_user(user_id: int) -> None:
    USER_REGISTER_DATA.pop(user_id)


async def check_user_name(interaction: disnake.ModalInteraction, name: str) -> bool:
    language = await server_config.get_language()
    match_patter = r"[\p{L}'’\s-]+"
    if not regex.fullmatch(match_patter, name) or " " not in name:
        await send_ephemeral_response(
            interaction,
            message=await translation.translate("registration.incorrect_symbols_in_name_message", language),
        )
        return False
    return True
