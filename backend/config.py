import logging
import os

from dotenv import load_dotenv

load_dotenv()


class Config:
    def __init__(self):
        self.discord_bot_token = self._get_env_variable("DISCORD_BOT_TOKEN")
        self.supabase_key = self._get_env_variable("VITE_SUPABASE_ANON_KEY")
        self.supabase_url = self._get_env_variable("VITE_SUPABASE_URL")

    @staticmethod
    def _get_env_variable(var_name: str) -> str | None:
        value = os.environ.get(var_name)
        if not value:
            logging.warning(f"{var_name} environment variable is not set!")
            return None
        return value


config = Config()
