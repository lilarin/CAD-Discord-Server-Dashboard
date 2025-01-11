import disnake


async def init_register_buttons() -> disnake.ui.ActionRow:
    register = disnake.ui.Button(
        style=disnake.ButtonStyle.primary,
        label="📑 Зареєструватись",
        custom_id="register_button",
    )
    inactive = disnake.ui.Button(
        style=disnake.ButtonStyle.grey,
        label="👨‍🎓 Щоб пройти ідентифікацію на сервері",
        custom_id="inactive_button",
        disabled=True,
    )
    return disnake.ui.ActionRow(register, inactive)


async def init_name_confirm_button() -> disnake.ui.ActionRow:
    name_confirm = disnake.ui.Button(
        style=disnake.ButtonStyle.primary,
        label="✔️ Так, продовжити далі",
        custom_id="name_confirm_button",
    )
    return disnake.ui.ActionRow(name_confirm)


async def init_group_select(roles) -> disnake.ui.ActionRow:
    options = [
        disnake.SelectOption(
            label=role.name,
            value=str(role.id)
        ) for role in roles if not role.is_default() and "-" in role.name
    ]
    role_select = disnake.ui.Select(
        placeholder="...",
        options=options,
        custom_id="role_select_option"
    )
    return disnake.ui.ActionRow(role_select)


async def init_group_confirm_button() -> disnake.ui.ActionRow:
    group_confirm = disnake.ui.Button(
        style=disnake.ButtonStyle.green,
        label="✔️ Так, завершити реєстрацію",
        custom_id="group_confirm_button",
    )
    return disnake.ui.ActionRow(group_confirm)
