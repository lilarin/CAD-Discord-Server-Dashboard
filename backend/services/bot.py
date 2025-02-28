import disnake
from disnake.ext import commands

from backend.config import config
from backend.services.modals import (
    RegisterModal,
    USER_REGISTER_DATA,
    init_register_buttons,
    init_group_confirm_button,
    init_group_select,
    init_queue_buttons,
    init_user_select, init_switch_accept_button
)
from backend.services.responses import (
    send_ephemeral_response,
    edit_ephemeral_response
)

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
    if isinstance(error, commands.NoPrivateMessage):
        await send_ephemeral_response(
            interaction,
            f"Ви можете використовувати цю команду тільки на сервері",
        )


@bot.slash_command(
    name="створити-повідомлення-реєстрації",
    description="Створити повідомлення для реєстрації в поточному каналі"
)
@commands.has_any_role(config.administrator_role_id)
@commands.guild_only()
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
    interaction_component_id = interaction.component.custom_id

    if interaction_component_id == "role_select_option":
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

    elif interaction_component_id == "user_select_option":
        await send_ephemeral_response(interaction, f"Очікуйте...")

        values = interaction.values[0].split()
        selected_user_id = values[0]
        message_id = values[1]
        message = await interaction.channel.fetch_message(int(message_id))

        user = interaction.guild.get_member(int(selected_user_id))

        embed = disnake.Embed(
            title=f"Запит на обмін місцями у черзі {message.jump_url}",
            description=f"Від користувача {interaction.user.mention}\n",
            color=0xFFFFFF,
        )

        action_row = await init_switch_accept_button()

        try:
            await user.send(embed=embed, components=action_row)

            await edit_ephemeral_response(
                interaction,
                f"Запит на обмін місцями надіслано користувачу {user.mention}.\n"
                f"Очікуйте сповіщення з відповіддю від бота в особисті повідомлення"
            )
        except disnake.errors.Forbidden:
            await edit_ephemeral_response(
                interaction,
                f"Не вдалось надіслати запит на обмін місцями через налаштування приватності користувача"
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

    embed = interaction.message.embeds[0]
    if interaction_component_id == "join_queue_button":
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

    elif interaction_component_id == "switch_queue_places_button":
        users_ids = [user.split(" ")[1] for user in embed.description.split("\n")]
        users = [
            user for user in await interaction.guild.fetch_members().flatten()
            if user.mention in users_ids and user.id != interaction.user.id
        ]
        action_row = await init_user_select(users, interaction.message.id)
        await send_ephemeral_response(
            interaction,
            message="Оберіть користувача, з яким хочете обмінятись місцями:",
            components=action_row
        )

    elif interaction_component_id == "accept_switch_button":
        await send_ephemeral_response(interaction, f"Очікуйте...")

        jump_url = embed.title.split()[-1]
        channel_id = int(jump_url.split("/")[-2])
        message_id = int(jump_url.split("/")[-1])
        switch_user_id = int(embed.description.split()[-1][2:20])

        guild = await bot.fetch_guild(config.guild_id)
        channel = await guild.fetch_channel(channel_id)
        queue_message = await channel.fetch_message(message_id)
        queue_embed = queue_message.embeds[0]
        users_ids = [user.split(" ")[1] for user in queue_embed.description.split("\n")]
        target_user = None
        switch_user = None
        users = []

        for user in [await guild.fetch_member(int(user[2:20])) for user in users_ids]:
            if user.mention in users_ids:
                users.append(user)
                if user.id == interaction.user.id:
                    target_user = user
                elif user.id == switch_user_id:
                    switch_user = user

        if not target_user:
            await edit_ephemeral_response(
                interaction,
                "Ви не можете обмінятись місцями оскільки вас немає в черзі"
            )

        if not switch_user:
            await edit_ephemeral_response(
                interaction,
                "Ви не можете обмінятись місцями оскільки користувача немає в черзі"
            )

        target_user_index = users.index(target_user)
        switch_user_index = users.index(switch_user)

        users[target_user_index], users[switch_user_index] = users[switch_user_index], users[target_user_index]

        new_description = ""
        for user in users:
            new_description += f"\n1. {user.mention}"

        queue_embed.description = new_description

        action_row = await init_switch_accept_button(disabled=True)

        await interaction.message.edit(components=action_row)
        await queue_message.edit(embed=queue_embed)
        await edit_ephemeral_response(interaction, "Ви успішно обмінялись місцями у черзі!")

        embed = disnake.Embed(
            description=f"Ваш запит на обмін місцями у черзі {jump_url} схвалено",
            color=0xFFFFFF,
        )
        await switch_user.send(embed=embed)
