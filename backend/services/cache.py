import json

import redis.asyncio as redis
import redis.exceptions as exceptions

from backend.config import config
from backend.schemas import LogSchema
from backend.services.supabase_client import read_logs_from_supabase

REDIS_LOGS_KEY = "discord_admin_panel:logs"

redis_client = redis.Redis.from_url(config.redis_url)


async def set_logs_to_cache(logs: list[LogSchema]):
    try:
        serialized_logs = [log.model_dump() for log in logs]
        await redis_client.set(REDIS_LOGS_KEY, json.dumps(serialized_logs))
    except exceptions.ConnectionError as e:
        print(f"Redis connection error: {e}")
    except Exception as e:
        print(f"Error setting logs to cache: {e}")


async def get_logs_from_cache() -> list[LogSchema]:
    try:
        cached_logs = await redis_client.get(REDIS_LOGS_KEY)
        if cached_logs:
            deserialized_logs = json.loads(cached_logs)
            return [LogSchema(**log) for log in deserialized_logs]
    except exceptions.ConnectionError as e:
        print(f"Redis connection error: {e}, falling back to Supabase. Error: {e}")
    except Exception as e:
        print(f"Error getting logs from cache: {e}, falling back to Supabase.")

    supabase_logs = await read_logs_from_supabase()
    if supabase_logs:
        await set_logs_to_cache(supabase_logs)
    return supabase_logs
