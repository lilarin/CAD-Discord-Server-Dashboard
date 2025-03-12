from backend.services.bot_ui import create_registration_embed, init_register_buttons
from backend.services.fetch import fetch_channel


async def create_registration_message(
        channel_id: str,
) -> None:
    channel = await fetch_channel(int(channel_id))
    embed = await create_registration_embed()
    action_row = await init_register_buttons()

    await channel.send(embed=embed, components=action_row)
