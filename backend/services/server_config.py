import json
import os
from typing import Optional

import disnake

from backend.config import config
from backend.schemas import (
    ServerConfig,
    RegistrationConfigInfo,
    StaffConfigInfo,
    ServerConfigExtended,
    RegistrationConfigInfoExtended,
    StaffConfigInfoExtended
)
from backend.services.fetch import fetch_channel
from backend.utils.channels import check_channel_in_category
from backend.utils.validation import check_message_in_channel


class ServerConfigService:
    def __init__(self, server_config_path: str):
        self._server_config = None
        self._server_config_path = server_config_path

    async def get_config(self) -> ServerConfig:
        if not self._server_config:
            if os.path.exists(self._server_config_path):
                with open(self._server_config_path, "r", encoding="utf-8") as f:
                    content = f.read().strip()
                    if content:
                        self._server_config = ServerConfig(**json.loads(content))
                    else:
                        self._server_config = ServerConfig(
                            language=None,
                            registration=RegistrationConfigInfo(),
                            staff=StaffConfigInfo()
                        )
                        await self.update_config(self._server_config)
            else:
                self._server_config = ServerConfig(
                    language=None,
                    registration=RegistrationConfigInfo(),
                    staff=StaffConfigInfo()
                )
                await self.update_config(self._server_config)

        return self._server_config

    async def get_language(self) -> Optional[str]:
        config = await self.get_config()
        if config.language is None:
            raise ValueError("Language is not set")

        return config.language

    async def get_validated_config(self) -> ServerConfig:
        original_config = await self.get_config()
        validated_config = original_config.model_copy(deep=True)

        extended_config = ServerConfigExtended(
            language=original_config.language,
            registration=RegistrationConfigInfoExtended(),
            staff=StaffConfigInfoExtended()
        )

        if validated_config.staff.category_id:
            staff_category_id = validated_config.staff.category_id

            try:
                category = await fetch_channel(int(staff_category_id))
                if not category:
                    validated_config.staff.category_id = None
                    validated_config.staff.channel_id = None
                    validated_config.staff.message_id = None
                else:
                    extended_config.staff.category_id = str(category.id)
                    extended_config.staff.category_name = category.name
            except (disnake.errors.HTTPException, AttributeError):
                validated_config.staff.category_id = None
                validated_config.staff.channel_id = None
                validated_config.staff.message_id = None
            else:

                if validated_config.staff.channel_id:
                    staff_channel_id = validated_config.staff.channel_id

                    try:
                        channel = await fetch_channel(int(staff_channel_id))
                        if not await check_channel_in_category(int(staff_category_id), int(staff_channel_id), channel):
                            validated_config.staff.channel_id = None
                            validated_config.staff.message_id = None
                        else:
                            extended_config.staff.channel_id = str(channel.id)
                            extended_config.staff.channel_name = channel.name

                    except (disnake.errors.HTTPException, AttributeError):
                        validated_config.staff.channel_id = None
                        validated_config.staff.message_id = None
                    else:

                        if validated_config.staff.message_id:
                            staff_message_id = validated_config.staff.message_id

                            try:
                                if not await check_message_in_channel(int(staff_channel_id), int(staff_message_id)):
                                    validated_config.staff.message_id = None
                                else:
                                    extended_config.staff.message_id = str(staff_message_id)
                            except (disnake.errors.HTTPException, AttributeError):
                                validated_config.staff.message_id = None

        if validated_config.registration.channel_id:
            registration_channel_id = validated_config.registration.channel_id

            try:
                channel = await fetch_channel(int(registration_channel_id))
                if not channel:
                    validated_config.registration.channel_id = None
                    validated_config.registration.message_id = None
                else:
                    extended_config.registration.channel_id = str(channel.id)
                    extended_config.registration.channel_name = channel.name
            except (disnake.errors.HTTPException, AttributeError):
                validated_config.registration.channel_id = None
                validated_config.registration.message_id = None
            else:

                if validated_config.registration.message_id:
                    registration_message_id = int(validated_config.registration.message_id)

                    try:
                        if not await check_message_in_channel(int(registration_channel_id),
                                                              int(registration_message_id)):
                            validated_config.registration.message_id = None
                        else:
                            extended_config.registration.message_id = str(registration_message_id)
                    except (disnake.errors.HTTPException, AttributeError):
                        validated_config.registration.message_id = None

        if validated_config != original_config:
            await self.update_config(validated_config)

        return extended_config

    async def update_config(self, new_config: ServerConfig):
        os.makedirs(os.path.dirname(self._server_config_path), exist_ok=True)
        with open(self._server_config_path, "w", encoding="utf-8") as f:
            json.dump(new_config.model_dump(), f, indent=2)
        self._server_config = new_config


print(config.data_path)
server_config = ServerConfigService(config.data_path + "/server_config.json")
