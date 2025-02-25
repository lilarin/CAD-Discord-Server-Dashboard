import disnake
from disnake.ext import commands

from backend.config import config
from backend.services.modals import (
    RegisterModal,
    USER_REGISTER_DATA,
    init_register_buttons,
    init_group_confirm_button,
    init_group_select,
    init_queue_buttons
)
from backend.services.responses import send_ephemeral_response

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
@commands.has_any_role(config.administrator_role_id)
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
            student_role = interaction.guild.get_role(config.student_role_id)
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

    elif interaction_component_id == "join_queue_button":
        embed = interaction.message.embeds[0]
        if not embed.description:
            await send_ephemeral_response(interaction, "Ви доєднались до черги")
            embed.description = f"\n1. {interaction.user.mention}"
            embed.clear_fields()
            action_row = await init_queue_buttons(leave_disabled=False)

            await interaction.message.edit(embed=embed, components=action_row)
        elif not str(interaction.user.id) in embed.description:
            await send_ephemeral_response(interaction, "Ви доєднались до черги")
            embed.description += f"\n1. {interaction.user.mention}"
            action_row = await init_queue_buttons(leave_disabled=False, switch_disabled=False)

            await interaction.message.edit(embed=embed, components=action_row)
        else:
            await send_ephemeral_response(interaction, "Ви вже у черзі")

    elif interaction_component_id == "leave_queue_button":
        embed = interaction.message.embeds[0]
        if not embed.description or not str(interaction.user.id) in embed.description:
            await send_ephemeral_response(interaction, "Ви не в черзі")
        else:
            await send_ephemeral_response(interaction, "Ви вийшли з черги")
            new_description = ""
            users = embed.description.split("\n")
            for user in users:
                if not str(interaction.user.id) in user:
                    new_description += f"\n{user}"

            if new_description == "":
                new_description = None
                embed.add_field("", "-# Черга порожня")
                action_row = await init_queue_buttons()
                embed.description = new_description
                await interaction.message.edit(embed=embed, components=action_row)
            elif len(users) == 2: # last user + left user
                action_row = await init_queue_buttons(leave_disabled=False)
                embed.description = new_description
                await interaction.message.edit(embed=embed, components=action_row)
            else:
                embed.description = new_description
                await interaction.message.edit(embed=embed)
