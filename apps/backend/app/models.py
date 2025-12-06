from pydantic import BaseModel
from typing import Optional, Literal


class TaskResponse(BaseModel):
    task_id: str
    status: Literal["queued", "processing", "success", "failed"]
    markdown: Optional[str] = None
    error: Optional[str] = None


class HealthResponse(BaseModel):
    status: str
    redis: str
