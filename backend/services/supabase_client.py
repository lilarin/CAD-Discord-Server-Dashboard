import datetime

import postgrest
from disnake import Member
from fastapi import HTTPException
from supabase import create_client, Client

from backend.config import config
from backend.middlewares.supabase import logs_table_exists
from backend.schemas import LogSchema

supabase: Client = create_client(config.supabase_url, config.supabase_key)


@logs_table_exists
async def save_log_to_supabase(user: Member, action: str) -> None:
    try:
        name = user.display_name
        avatar = user.avatar.url
        timestamp = datetime.datetime.now(datetime.timezone.utc).isoformat()

        log_data = {
            "user_name": name,
            "user_avatar": avatar,
            "action": action,
            "created_at": timestamp,
        }
        supabase.table("logs").insert(log_data).execute()

    except postgrest.exceptions.APIError as e:
        raise HTTPException(detail=f"Error during Supabase logging: {e}", status_code=500)


@logs_table_exists
async def read_logs_from_supabase() -> list[LogSchema]:
    try:
        response = (
            supabase
            .table("logs")
            .select("*")
            .execute()
        )
        return [LogSchema(**log) for log in response.data[::-1]]

    except postgrest.exceptions.APIError as e:
        raise HTTPException(detail=f"Error during reading Supabase logs: {e}", status_code=500)
