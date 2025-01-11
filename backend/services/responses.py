import disnake


async def send_ephemeral_response(interaction, message, components=None):
    ephemeral_response = disnake.Embed(description=message, color=0xFFFFFF)
    if components:
        await interaction.send(
            embed=ephemeral_response, ephemeral=True, components=components
        )
        return
    await interaction.send(
        embed=ephemeral_response, ephemeral=True
    )


async def edit_ephemeral_response(interaction, message):
    ephemeral_response = disnake.Embed(description=message, color=0xFFFFFF)
    await interaction.edit_original_response(embed=ephemeral_response)
