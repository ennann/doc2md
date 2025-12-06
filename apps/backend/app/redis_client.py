import redis
from app.config import settings

redis_client = redis.Redis(
    host=settings.redis_host,
    port=settings.redis_port,
    db=settings.redis_db,
    decode_responses=False  # Keep as bytes for file data
)


def get_redis():
    return redis_client
