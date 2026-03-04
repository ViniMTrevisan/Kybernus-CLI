import redis.asyncio as aioredis
from typing import Optional

redis: Optional[aioredis.Redis] = None


async def connect_redis() -> None:
    global redis
    redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
    redis = await aioredis.from_url(redis_url, decode_responses=True)
    print("✅ Redis connected")


async def disconnect_redis() -> None:
    if redis:
        await redis.close()


def get_redis() -> aioredis.Redis:
    if redis is None:
        raise RuntimeError("Redis is not connected. Call connect_redis() first.")
    return redis
