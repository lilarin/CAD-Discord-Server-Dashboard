import logging
import os

from dotenv import load_dotenv

load_dotenv()


class Config:
    def __init__(self):
        self.discord_bot_token = self._get_env_variable("DISCORD_BOT_TOKEN")
        self.administrator_role_id = int(self._get_env_variable("ADMINISTRATOR_ROLE_ID"))
        self.teacher_role_id = int(self._get_env_variable("TEACHER_ROLE_ID"))
        self.student_role_id = int(self._get_env_variable("STUDENT_ROLE_ID"))
        self.guild_id = int(self._get_env_variable("GUILD_ID"))

        self.supabase_direct_url = self._get_env_variable("SUPABASE_DIRECT_URL")
        self.supabase_url = self._get_env_variable("VITE_SUPABASE_URL")
        self.supabase_key = self._get_env_variable("VITE_SUPABASE_SERVICE_ROLE_KEY")

    @staticmethod
    def _get_env_variable(var_name: str) -> str | None:
        value = os.environ.get(var_name)
        if not value:
            logging.warning(f"{var_name} environment variable is not set!")
            return None
        return value


config = Config()
