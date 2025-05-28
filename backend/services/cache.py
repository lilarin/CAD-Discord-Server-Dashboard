import json

import redis.asyncio as redis
import redis.exceptions as exceptions

from backend.config import config
from backend.schemas import LogSchema
from backend.services.supabase_client import read_logs_from_supabase
from backend.utils.logger import logger

redis_client = redis.Redis.from_url(config.redis_url)


async def set_logs_to_cache(logs: list[LogSchema]):
    try:
        serialized_logs = [log.model_dump() for log in logs]
        await redis_client.set(config.redis_logs_key, json.dumps(serialized_logs))
    except exceptions.ConnectionError as error:
        logger.error(f"Redis connection error: {error}")


async def get_logs_from_cache() -> list[LogSchema]:
    try:
        cached_logs = await redis_client.get(config.redis_logs_key)
        if cached_logs:
            deserialized_logs = json.loads(cached_logs)
            return [LogSchema(**log) for log in deserialized_logs]
    except exceptions.ConnectionError as error:
        logger.error(f"Redis connection error: {error}, falling back to Supabase")
    return await read_logs_from_supabase()


async def update_logs_cache():
    supabase_logs = await read_logs_from_supabase()
    if supabase_logs:
        await set_logs_to_cache(supabase_logs)
        logger.info("Cache refreshed")
