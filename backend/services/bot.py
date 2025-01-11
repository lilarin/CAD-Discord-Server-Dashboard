from disnake.ext import commands
import disnake

from backend.config import config


bot = commands.InteractionBot(intents=disnake.Intents.all())

async def run_bot():
    await bot.start(config.discord_bot_token)
