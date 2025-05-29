import logging
import os
import sys

from dotenv import load_dotenv


class Config:
    def __init__(self):
        load_dotenv()
        self.discord_bot_token = self._get_env_variable("DISCORD_BOT_TOKEN")
        self.administrator_role_id = int(self._get_env_variable("ADMINISTRATOR_ROLE_ID"))
        self.teacher_role_id = int(self._get_env_variable("TEACHER_ROLE_ID"))
        self.student_role_id = int(self._get_env_variable("STUDENT_ROLE_ID"))
        self.guild_id = int(self._get_env_variable("GUILD_ID"))
        self.supabase_direct_url = self._get_env_variable("SUPABASE_DIRECT_URL")
        self.supabase_url = self._get_env_variable("VITE_SUPABASE_URL")
        self.supabase_key = self._get_env_variable("VITE_SUPABASE_SERVICE_ROLE_KEY")
        self.redis_url = self._get_env_variable("REDIS_URL")

        self.frontend_url = "http://localhost:8080"

        self.redis_logs_key = "discord_admin_panel:logs"
        self.server_config_path = "backend/server_config.json"
        self.locales_path = "backend/locales"
        self.locales = ["en", "uk"]

    @staticmethod
    def _get_env_variable(var_name: str) -> str | None:
        value = os.environ.get(var_name)
        if not value:
            logger.error(f"{var_name} environment variable is not set!")
            return None
        return value

    @staticmethod
    def setup_logging():
        logging.basicConfig(
            level=logging.INFO,
            format="%(levelname)s:     %(name)s - %(message)s",
            handlers=[
                logging.StreamHandler(sys.stdout),
            ],
        )

        return logging.getLogger("uvicorn")

config = Config()
logger = config.setup_logging()
