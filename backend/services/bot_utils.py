import disnake

from backend.config import config
from backend.services.bot_ui import (
    RegisterModal,
    init_group_confirm_button,
    init_group_select,
    init_queue_buttons,
    init_user_select,
    init_switch_accept_button,
    create_switch_accepted_embed
)
from backend.utils.response import (
    send_ephemeral_response,
    edit_ephemeral_response
)
from backend.services.users_registration import (
    remove_registration_user,
    get_registration_user_info
)


async def handle_role_selection(interaction: disnake.MessageInteraction):
    selected_role_id = interaction.values[0]
    role = interaction.guild.get_role(int(selected_role_id))

    user_info = await get_registration_user_info(interaction)
    if user_info:
        user_info.role = role
        await send_ephemeral_response(
            interaction,
            f"Ви обрали групу: \n"
            f"### {role.name} \n "
            f"Чи підтверджуєте правильність вибору?",
            components=await init_group_confirm_button()
        )


async def handle_user_selection_for_queue_switch(interaction: disnake.MessageInteraction):
    await send_ephemeral_response(interaction, "Очікуйте...")

    values = interaction.values[0].split()
    selected_user_id = values[0]
    message_id = values[1]
    message = await interaction.channel.fetch_message(int(message_id))
    user = interaction.guild.get_member(int(selected_user_id))

    embed = create_switch_request_embed(interaction, message)
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
            "Не вдалось надіслати запит на обмін місцями через налаштування приватності користувача"
        )


def create_switch_request_embed(interaction: disnake.MessageInteraction, message: disnake.Message):
    embed = disnake.Embed(
        title=f"Запит на обмін місцями у черзі {message.jump_url}",
        description=f"Від користувача {interaction.user.mention}\n",
        color=0xFFFFFF,
    )
    return embed


async def handle_register_button_click(interaction: disnake.MessageInteraction):
    await interaction.response.send_modal(
        modal=RegisterModal(interaction.user)
    )


async def handle_name_confirm_button_click(interaction: disnake.MessageInteraction):
    user_info = await get_registration_user_info(interaction)
    if user_info:
        await send_ephemeral_response(
            interaction,
            "Оберіть вашу навчальну групу\n"
            "-# Якщо її тут немає – повідомте вашого старосту",
            components=await init_group_select(interaction.guild.roles)
        )


async def handle_group_confirm_button_click(interaction: disnake.MessageInteraction):
    member = await interaction.guild.fetch_member(interaction.user.id)
    user_info = await get_registration_user_info(interaction)
    if user_info:
        group_role = user_info.role
        name = f"{group_role.name} {user_info.full_name}"
        await remove_registration_user(interaction.user.id)
        student_role = interaction.guild.get_role(config.student_role_id)
        try:
            await send_registration_confirmation(interaction, member, group_role, student_role, name)
        except disnake.Forbidden:
            pass


async def send_registration_confirmation(interaction: disnake.MessageInteraction, member: disnake.Member, group_role, student_role, name):
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


async def handle_join_queue_button_click(interaction: disnake.MessageInteraction, embed: disnake.Embed):
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


async def handle_leave_queue_button_click(interaction: disnake.MessageInteraction, embed: disnake.Embed):
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
        elif len(users) == 2:
            action_row = await init_queue_buttons(leave_disabled=False)
            embed.description = new_description
            await interaction.message.edit(embed=embed, components=action_row)
        else:
            embed.description = new_description
            await interaction.message.edit(embed=embed)


async def handle_switch_queue_places_button_click(interaction: disnake.MessageInteraction, embed: disnake.Embed):
    users_ids = [user.split(" ")[1] for user in embed.description.split("\n")]
    users = [
        user for user in await interaction.guild.fetch_members().flatten()
        if user and user.mention in users_ids and user.id != interaction.user.id
    ]

    if len(users) >= 1:
        action_row = await init_user_select(users, interaction.message.id)
        await send_ephemeral_response(
            interaction,
            message="Оберіть користувача, з яким хочете обмінятись місцями:",
            components=action_row
        )
    else:
        await send_ephemeral_response(
            interaction,
            message="Немає користувачів, з якими можна помінятись місцями"
        )


async def handle_accept_switch_button_click(interaction: disnake.MessageInteraction, embed: disnake.Embed):
    await send_ephemeral_response(interaction, "Очікуйте...")

    jump_url = embed.title.split()[-1]
    channel_id = int(jump_url.split("/")[-2])
    message_id = int(jump_url.split("/")[-1])
    switch_user_id = int(embed.description.split()[-1][2:20])

    guild = await interaction.bot.fetch_guild(config.guild_id)
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
        return

    if not switch_user:
        await edit_ephemeral_response(
            interaction,
            "Ви не можете обмінятись місцями оскільки користувача немає в черзі"
        )
        return

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

    embed = await create_switch_accepted_embed(jump_url)
    await switch_user.send(embed=embed)
