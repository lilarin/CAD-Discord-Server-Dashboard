from backend.services.bot_ui import create_registration_embed, init_register_buttons
from backend.services.fetch import fetch_channel


async def send_registration_message(
        channel_id: str,
) -> int:
    channel = await fetch_channel(int(channel_id))
    embed = await create_registration_embed()
    action_row = await init_register_buttons()
    message = await channel.send(embed=embed, components=action_row)

    return message.id
