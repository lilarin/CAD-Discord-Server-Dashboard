import disnake
import aiohttp

from backend.common.variables import variables
from backend.config import config
from backend.schemas import BaseChannel


async def update_channel_order(payload: list[BaseChannel]):
    try:
        url = f"https://discord.com/api/v10/guilds/{variables.GUILD_ID}/channels"
        headers = {
            "Authorization": f"Bot {config.discord_bot_token}",
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
        serializable_response = [channel.model_dump() for channel in payload]
        async with aiohttp.ClientSession() as session:
            async with session.patch(url, headers=headers, json=serializable_response) as response:
                if not response.ok:
                    raise disnake.errors.HTTPException(response=response, message=str(response))
    except Exception:
        raise
