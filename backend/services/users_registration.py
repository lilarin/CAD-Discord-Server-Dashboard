from dataclasses import dataclass

import disnake

from backend.services.responses import send_ephemeral_response

USER_REGISTER_DATA = {}


@dataclass
class UserRegistrationData:
    full_name: str
    role: disnake.Role = None


async def get_user_info(interaction: disnake.MessageInteraction):
    user_info = USER_REGISTER_DATA.get(interaction.user.id)

    if user_info:
        return user_info

    await send_ephemeral_response(
        interaction,
        "Будь ласка, розпочніть реєстрацію заново, стара вже форма не дійсна"
    )