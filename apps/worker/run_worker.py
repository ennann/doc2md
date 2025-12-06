#!/usr/bin/env python3
"""
RQ Worker runner for Doc2MD conversion tasks.
"""
import redis
from rq import Worker, Queue
from worker.config import REDIS_HOST, REDIS_PORT, REDIS_DB

if __name__ == '__main__':
    # Connect to Redis
    redis_conn = redis.Redis(
        host=REDIS_HOST,
        port=REDIS_PORT,
        db=REDIS_DB
    )

    # Create worker for the default queue
    worker = Worker(['default'], connection=redis_conn)

    print(f"Starting RQ worker connected to Redis at {REDIS_HOST}:{REDIS_PORT}")
    print("Listening for conversion tasks...")

    # Start the worker
    worker.work()
