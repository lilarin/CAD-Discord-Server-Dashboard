import logging
import os
import sys
from typing import Optional

from dotenv import load_dotenv

from backend.services.translation import TranslationService


class Config:
    def __init__(self):
        load_dotenv()
        self.logger = self._setup_logging()

        self.discord_bot_token = self._get_env_variable("DISCORD_BOT_TOKEN")
        self.administrator_role_id = int(self._get_env_variable("ADMINISTRATOR_ROLE_ID"))
        self.teacher_role_id = int(self._get_env_variable("TEACHER_ROLE_ID"))
        self.student_role_id = int(self._get_env_variable("STUDENT_ROLE_ID"))
        self.guild_id = int(self._get_env_variable("GUILD_ID"))
        self.supabase_direct_url = self._get_env_variable("SUPABASE_DIRECT_URL")
        self.supabase_url = self._get_env_variable("VITE_SUPABASE_URL")
        self.supabase_key = self._get_env_variable("VITE_SUPABASE_SERVICE_ROLE_KEY")
        self.redis_url = self._get_env_variable("REDIS_URL")

        self.frontend_url = self._get_env_variable("FRONTEND_URL")
        self.registration_embed_image_url = "https://imgur.com/uG2M5wK.png"

        self.redis_logs_key = "discord_admin_panel:logs"
        self.locales = ["en", "uk"]

        self.locales_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "locales")

    @staticmethod
    def _setup_logging():
        logging.basicConfig(
            level=logging.INFO,
            format="%(levelname)s:     %(name)s - %(message)s",
            handlers=[
                logging.StreamHandler(sys.stdout),
            ],
        )
        return logging.getLogger("uvicorn")

    def _get_env_variable(self, var_name: str) -> Optional[str]:
        value = os.environ.get(var_name)
        if not value:
            self.logger.error(f"{var_name} environment variable is not set!")
            return None
        return value


config = Config()
logger = config.logger
translation = TranslationService(config.locales, config.locales_path)
