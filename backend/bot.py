import disnake
from disnake.ext import commands

from backend.config import config, logger
from backend.services.bot_utils import (
    handle_role_selection,
    handle_user_selection_for_queue_switch,
    handle_register_button_click,
    handle_name_confirm_button_click,
    handle_group_confirm_button_click,
    handle_join_queue_button_click,
    handle_leave_queue_button_click,
    handle_switch_queue_places_button_click,
    handle_accept_switch_button_click
)

bot = commands.InteractionBot(intents=disnake.Intents.all())


async def run_bot():
    await bot.start(config.discord_bot_token)


@bot.event
async def on_ready():
    logger.info(f"Bot is ready. Logged in as {bot.user}")


@bot.event
async def on_dropdown(interaction: disnake.MessageInteraction) -> None:
    interaction_component_id = interaction.component.custom_id

    if interaction_component_id == "role_select_option":
        await handle_role_selection(interaction)
    elif interaction_component_id == "user_select_option":
        await handle_user_selection_for_queue_switch(interaction)


@bot.event
async def on_button_click(interaction: disnake.MessageInteraction) -> None:
    interaction_component_id = interaction.component.custom_id
    embed = interaction.message.embeds[0]

    if interaction_component_id == "register_button":
        await handle_register_button_click(interaction)
    elif interaction_component_id == "name_confirm_button":
        await handle_name_confirm_button_click(interaction)
    elif interaction_component_id == "group_confirm_button":
        await handle_group_confirm_button_click(interaction)
    elif interaction_component_id == "join_queue_button":
        await handle_join_queue_button_click(interaction, embed)
    elif interaction_component_id == "leave_queue_button":
        await handle_leave_queue_button_click(interaction, embed)
    elif interaction_component_id == "switch_queue_places_button":
        await handle_switch_queue_places_button_click(interaction, embed)
    elif interaction_component_id == "accept_switch_button":
        await handle_accept_switch_button_click(interaction, embed)
