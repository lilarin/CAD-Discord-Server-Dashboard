from disnake.ext import commands
import disnake

from backend.common.variables import variables
from backend.config import config
from backend.services.modals import RegisterModal, USER_REGISTER_DATA
from backend.services.responses import send_ephemeral_response
from backend.services.utils import init_group_confirm_button, init_group_select, init_register_buttons

bot = commands.InteractionBot(intents=disnake.Intents.all())


async def run_bot():
    await bot.start(config.discord_bot_token)


@bot.event
async def on_ready():
    print(f"Bot is ready. Logged in as {bot.user}")


@bot.event
async def on_slash_command_error(interaction, error):
    if isinstance(error, commands.MissingAnyRole):
        await send_ephemeral_response(
            interaction,
            "Ви не можете використовувати цю команду",
        )


@bot.slash_command(
    name="створити-повідомлення-реєстрації",
    description="Створити повідомлення для реєстрації в поточному каналі"
)
@commands.has_any_role(variables.ADMINISTRATOR_ROLE_ID)
async def create_register_message(
        interaction: disnake.ApplicationCommandInteraction
) -> None:
    embed = disnake.Embed(
        title="Кафедра Системного Проєктування ІПСА",
        description=(
            "Щоб отримати доступ до серверу необхідно пройти реєстрацію. "
            "Натисніть на кнопку під повідомленням та дотримуйтесь інструкцій\n"
            "-# Викладачам достатньо першого пункту, вказати прізвище та ім'я"
        ),
        color=0xFFFFFF,
    )
    embed.set_image(url="https://imgur.com/uG2M5wK.png")

    action_row = await init_register_buttons()
    await interaction.channel.send(embed=embed, components=action_row)

    await send_ephemeral_response(interaction, "Повідомлення створено")


@bot.event
async def on_dropdown(interaction: disnake.MessageInteraction) -> None:
    if interaction.component.custom_id == "role_select_option":
        selected_role_id = interaction.values[0]
        role = interaction.guild.get_role(int(selected_role_id))

        user_info = USER_REGISTER_DATA.get(interaction.user.id)
        if user_info:
            user_info.role = role

        await send_ephemeral_response(
            interaction,
            f"Ви обрали групу: \n"
            f"### {role.name} \n "
            f"Чи підтверджуєте правильність вибору?",
            components=await init_group_confirm_button()
        )


@bot.event
async def on_button_click(interaction: disnake.MessageInteraction) -> None:
    interaction_component_id = interaction.component.custom_id

    if interaction_component_id == "register_button":
        await interaction.response.send_modal(
            modal=RegisterModal(interaction.user)
        )

    elif interaction_component_id == "name_confirm_button":
        user_info = USER_REGISTER_DATA.get(interaction.user.id)
        if user_info:
            await send_ephemeral_response(
                interaction,
                "Оберіть вашу навчальну групу\n"
                "-# Якщо її тут немає – повідомте вашого старосту",
                components=await init_group_select(interaction.guild.roles)
            )

    elif interaction_component_id == "group_confirm_button":
        member = await interaction.guild.fetch_member(interaction.user.id)
        user_info = USER_REGISTER_DATA.get(interaction.user.id)
        if user_info:
            group_role = user_info.role
            name = f"{group_role.name} {user_info.full_name}"
            USER_REGISTER_DATA.pop(interaction.user.id)
            student_role = interaction.guild.get_role(variables.STUDENT_ROLE_ID)
            try:
                await send_ephemeral_response(
                    interaction, "Дякуємо за проходження реєстрації"
                )
                await member.add_roles(
                    group_role, reason="Видача ролі групи"
                )
                await member.add_roles(
                    student_role, reason="Видача ролі студента"
                )
                await member.edit(
                    nick=name, reason="Зміна нікнейму, викликана самим користувачем"
                )
            except disnake.Forbidden:
                pass
