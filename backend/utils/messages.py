from datetime import datetime

from backend.services.bot_ui import (
    create_queue_message_embed,
    init_queue_buttons,
    init_staff_info_message_button,
    create_staff_info_message_embed
)
from backend.services.fetch import fetch_channel


async def create_queue_message(
        channel_id: str,
        title: str,
        event_time: str,
) -> None:
    channel = await fetch_channel(int(channel_id))
    timestamp = datetime.fromisoformat(event_time)

    embed = await create_queue_message_embed(title, timestamp)
    action_row = await init_queue_buttons()

    await channel.send(embed=embed, components=action_row)


async def send_staff_info_message(channel_id: int) -> int:
    channel = await fetch_channel(channel_id)
    embed = await create_staff_info_message_embed()
    action_row = await init_staff_info_message_button()

    message = await channel.send(embed=embed, components=action_row)

    return message.id
