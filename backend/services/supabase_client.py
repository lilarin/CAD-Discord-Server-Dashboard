import postgrest
import datetime

from disnake import Member
from fastapi import HTTPException

from supabase import create_client, Client

from backend.config import config
from backend.schemas import LogSchema

supabase: Client = create_client(config.supabase_url, config.supabase_key)


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


async def read_logs_from_supabase() -> list[LogSchema]:
    try:
        response = (
            supabase
            .table("logs")
            .select("*")
            .execute()
        )
        # logs = []
        # for log in response.data[::-1]:
        #     data = LogSchema(**log)
        #     created_at_datetime = datetime.datetime.fromisoformat(data.created_at.replace('Z', '+00:00'))
        #     data.created_at = created_at_datetime.strftime("%H:%M %d-%m-%Y")
        #     logs.append(data)
        #
        # return logs
        return [LogSchema(**log) for log in response.data[::-1]]

    except postgrest.exceptions.APIError as e:
        raise HTTPException(detail=f"Error during reading Supabase logs: {e}", status_code=500)
