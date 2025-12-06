import redis
import json
import tempfile
import os
from pathlib import Path
from markitdown import MarkItDown
from worker.config import REDIS_HOST, REDIS_PORT, REDIS_DB

# Initialize Redis client
redis_client = redis.Redis(
    host=REDIS_HOST,
    port=REDIS_PORT,
    db=REDIS_DB,
    decode_responses=False
)

# Initialize MarkItDown converter
md_converter = MarkItDown()


def convert_document(task_id: str, filename: str):
    """
    Convert a document to Markdown using markitdown.

    Args:
        task_id: Unique task identifier
        filename: Original filename for extension detection
    """
    try:
        # Update status to processing
        task_data = {
            "filename": filename,
            "status": "processing"
        }
        redis_client.setex(
            f"task:{task_id}",
            300,  # 5 minutes TTL
            json.dumps(task_data)
        )

        # Get file bytes from Redis
        file_bytes = redis_client.get(f"file:{task_id}")

        if not file_bytes:
            raise Exception("File data not found in Redis")

        # Get file extension
        file_ext = Path(filename).suffix if filename else ".docx"

        # Create temporary file
        with tempfile.NamedTemporaryFile(suffix=file_ext, delete=False) as tmp_file:
            tmp_file.write(file_bytes)
            tmp_file.flush()
            tmp_path = tmp_file.name

        try:
            # Convert document to markdown using markitdown
            result = md_converter.convert(tmp_path)
            markdown_content = result.text_content

            # Store markdown result in Redis
            redis_client.setex(
                f"markdown:{task_id}",
                300,  # 5 minutes TTL
                markdown_content.encode('utf-8')
            )

            # Update task status to success
            task_data["status"] = "success"
            redis_client.setex(
                f"task:{task_id}",
                300,
                json.dumps(task_data)
            )

            # Delete file bytes from Redis (no longer needed)
            redis_client.delete(f"file:{task_id}")

        finally:
            # Clean up temporary file
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)

    except Exception as e:
        # Update task status to failed
        task_data = {
            "filename": filename,
            "status": "failed",
            "error": str(e)
        }
        redis_client.setex(
            f"task:{task_id}",
            300,
            json.dumps(task_data)
        )

        # Clean up file bytes
        redis_client.delete(f"file:{task_id}")

        # Re-raise exception for RQ to log
        raise
