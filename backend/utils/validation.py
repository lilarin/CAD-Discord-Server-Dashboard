from backend.services.fetch import fetch_message, fetch_channel


async def check_message_in_channel(channel_id: int, message_id: int) -> bool:
    message = await fetch_message(channel_id, message_id)
    return bool(message)


async def check_category_exists(category_id: int) -> bool:
    return await fetch_channel(category_id) is not None
