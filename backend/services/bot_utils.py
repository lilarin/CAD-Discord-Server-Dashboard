import disnake

from backend.config import config, translation
from backend.services.bot_ui import (
    RegisterModal,
    init_group_confirm_button,
    init_group_select,
    init_queue_buttons,
    init_user_select,
    init_switch_accept_button,
    create_switch_accepted_embed
)
from backend.services.server_config import server_config
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
        language = await server_config.get_language()
        message = await translation.translate("registration.role_selection", language)
        message = message.format(role_name=role.name)
        user_info.role = role
        await send_ephemeral_response(
            interaction,
            message,
            components=await init_group_confirm_button()
        )


async def handle_user_selection_for_queue_switch(interaction: disnake.MessageInteraction):
    language = await server_config.get_language()
    message = await translation.translate("utils.wait_message", language)
    await send_ephemeral_response(interaction, message)

    values = interaction.values[0].split()
    selected_user_id = values[0]
    message_id = values[1]
    message = await interaction.channel.fetch_message(int(message_id))
    user = interaction.guild.get_member(int(selected_user_id))

    embed = await create_switch_request_embed(interaction, message)
    action_row = await init_switch_accept_button()

    try:
        await user.send(embed=embed, components=action_row)
        message = await translation.translate("queue.places_switch_sent", language)
        message = message.format(user_mention=user.mention)
        await edit_ephemeral_response(interaction, message)
    except disnake.errors.Forbidden:
        message = await translation.translate("queue.places_switch_errored", language)
        await edit_ephemeral_response(interaction, message)


async def create_switch_request_embed(interaction: disnake.MessageInteraction, message: disnake.Message):
    language = await server_config.get_language()
    title = await translation.translate("queue.switch_request_title", language)
    title = title.format(jump_url=message.jump_url)
    description = await translation.translate("queue.switch_request_description", language)
    description = description.format(user_mention=interaction.user.mention)

    embed = disnake.Embed(
        title=title,
        description=description,
        color=0xFFFFFF,
    )
    return embed


async def handle_register_button_click(interaction: disnake.MessageInteraction):
    language = await server_config.get_language()
    label = await translation.translate("registration.modal_label", language)
    placeholder = await translation.translate("registration.modal_placeholder", language)
    await interaction.response.send_modal(
        modal=RegisterModal(interaction.user, label, placeholder)
    )


async def handle_name_confirm_button_click(interaction: disnake.MessageInteraction):
    user_info = await get_registration_user_info(interaction)
    if user_info:
        language = await server_config.get_language()
        message = await translation.translate("registration.chose_academic_group", language)
        await send_ephemeral_response(
            interaction,
            message,
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
    language = await server_config.get_language()
    await send_ephemeral_response(
        interaction, message=await translation.translate("utils.registration_completed", language)
    )
    await member.add_roles(
        group_role, reason=await translation.translate("utils.log_add_group_role", language)
    )
    await member.add_roles(
        student_role, reason=await translation.translate("utils.log_add_student_role", language)
    )
    await member.edit(
        nick=name, reason=await translation.translate("utils.log_change_student_nickname", language)
    )


async def handle_join_queue_button_click(interaction: disnake.MessageInteraction, embed: disnake.Embed):
    language = await server_config.get_language()
    if not embed.description:
        await send_ephemeral_response(interaction, message=await translation.translate("queue.join_queue_message", language))
        embed.description = f"\n1. {interaction.user.mention}"
        embed.clear_fields()
        action_row = await init_queue_buttons(leave_disabled=False)

        await interaction.message.edit(embed=embed, components=action_row)
    elif not str(interaction.user.id) in embed.description:
        await send_ephemeral_response(interaction, message=await translation.translate("queue.join_queue_message", language))
        embed.description += f"\n1. {interaction.user.mention}"
        action_row = await init_queue_buttons(leave_disabled=False, switch_disabled=False)

        await interaction.message.edit(embed=embed, components=action_row)
    else:
        await send_ephemeral_response(interaction, message=await translation.translate("queue.already_in_queue_message", language))


async def handle_leave_queue_button_click(interaction: disnake.MessageInteraction, embed: disnake.Embed):
    language = await server_config.get_language()
    if not embed.description or not str(interaction.user.id) in embed.description:
        await send_ephemeral_response(interaction, message=await translation.translate("queue.not_in_queue_message", language))
    else:
        await send_ephemeral_response(interaction, message=await translation.translate("queue.left_queue_message", language))
        new_description = ""
        users = embed.description.split("\n")
        for user in users:
            if not str(interaction.user.id) in user:
                new_description += f"\n{user}"

        if new_description == "":
            new_description = None
            embed.add_field("", await translation.translate("queue.empty_field", language))
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
    language = await server_config.get_language()
    users_ids = [user.split(" ")[1] for user in embed.description.split("\n")]
    users = [
        user for user in await interaction.guild.fetch_members().flatten()
        if user and user.mention in users_ids and user.id != interaction.user.id
    ]

    if len(users) >= 1:
        action_row = await init_user_select(users, interaction.message.id)
        await send_ephemeral_response(
            interaction,
            message=await translation.translate("queue.select_user_to_switch_message", language),
            components=action_row
        )
    else:
        await send_ephemeral_response(
            interaction,
            message=await translation.translate("queue.no_user_to_switch_message", language),
        )


async def handle_accept_switch_button_click(interaction: disnake.MessageInteraction, embed: disnake.Embed):
    language = await server_config.get_language()
    await send_ephemeral_response(interaction, await translation.translate("utils.wait_message", language))

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
            message=await translation.translate("queue.user_cannot_switch_not_in_queue_message", language)
        )
        return

    if not switch_user:
        await edit_ephemeral_response(
            interaction,
            message=await translation.translate("queue.target_user_not_in_queue_message", language)
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
    await edit_ephemeral_response(
        interaction,
        message=await translation.translate("queue.switched_places_in_queue_message", language),
    )

    embed = await create_switch_accepted_embed(jump_url)
    await switch_user.send(embed=embed)
