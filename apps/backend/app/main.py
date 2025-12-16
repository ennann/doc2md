from fastapi import FastAPI, File, UploadFile, HTTPException, Header, Depends, BackgroundTasks, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uuid
import json
import subprocess
from rq import Queue
from app.config import settings
from app.redis_client import get_redis
from app.models import TaskResponse, HealthResponse
from app import db

app = FastAPI(
    title="Doc2MD API",
    description="Privacy-first document to markdown converter",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    db.init_db()


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    redis_client = get_redis()
    try:
        redis_client.ping()
        redis_status = "connected"
    except Exception:
        redis_status = "disconnected"

    return HealthResponse(status="ok", redis=redis_status)


@app.get("/stats")
async def get_stats(x_deploy_token: str = Header(None)):
    """Get conversion stats (protected)"""
    # Simple protection using the same deploy token
    if settings.deploy_token and x_deploy_token != settings.deploy_token:
        # Allow if no deploy token set (dev mode) or match failed
        if settings.deploy_token:
             raise HTTPException(status_code=401, detail="Invalid token")
    
    return db.get_stats()


@app.post("/convert", response_model=TaskResponse)
async def convert_document(
    background_tasks: BackgroundTasks,
    request: Request,
    file: UploadFile = File(...)
):
    """
    Upload a document for conversion to Markdown.
    Returns a task_id for polling the conversion status.
    """
    # Validate file extension
    allowed_extensions = [".docx", ".pdf", ".pptx", ".doc", ".xlsx", ".html"]
    file_ext = file.filename.split(".")[-1].lower() if file.filename else ""

    if f".{file_ext}" not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type. Allowed: {', '.join(allowed_extensions)}"
        )

    # Generate task ID
    task_id = str(uuid.uuid4())

    # Read file bytes
    file_bytes = await file.read()
    
    # Extract Client IP (support proxy headers)
    client_ip = request.client.host
    if request.headers.get("x-forwarded-for"):
        client_ip = request.headers.get("x-forwarded-for").split(",")[0].strip()
    elif request.headers.get("x-real-ip"):
        client_ip = request.headers.get("x-real-ip")
        
    # Extract other headers
    user_agent = request.headers.get("user-agent")
    accept_language = request.headers.get("accept-language")
    
    # Log conversion stats asynchronously
    background_tasks.add_task(db.log_conversion, file.filename, len(file_bytes), client_ip, user_agent, accept_language)

    # Store file data and metadata in Redis
    redis_client = get_redis()
    # task_data is not actually used here, just defined
    
    # Store in Redis with TTL
    redis_client.setex(
        f"task:{task_id}",
        settings.task_ttl,
        json.dumps({
            "filename": file.filename,
            "status": "queued"
        })
    )

    # Store file bytes separately (binary data)
    redis_client.setex(
        f"file:{task_id}",
        settings.task_ttl,
        file_bytes
    )

    # Add to RQ queue
    queue = Queue(connection=redis_client)
    queue.enqueue(
        'worker.tasks.convert_document',
        task_id,
        file.filename,
        job_timeout='5m'
    )

    return TaskResponse(
        task_id=task_id,
        status="queued"
    )


@app.get("/task/{task_id}", response_model=TaskResponse)
async def get_task_status(task_id: str):
    """
    Get the status of a conversion task.
    Returns the markdown content when conversion is complete.
    """
    redis_client = get_redis()

    # Get task data from Redis
    task_data_bytes = redis_client.get(f"task:{task_id}")

    if not task_data_bytes:
        raise HTTPException(status_code=404, detail="Task not found or expired")

    task_data = json.loads(task_data_bytes)

    response = TaskResponse(
        task_id=task_id,
        status=task_data["status"]
    )

    if task_data["status"] == "success":
        # Get markdown content
        markdown_bytes = redis_client.get(f"markdown:{task_id}")
        if markdown_bytes:
            response.markdown = markdown_bytes.decode('utf-8')
    elif task_data["status"] == "failed":
        response.error = task_data.get("error", "Unknown error")

    return response


@app.post("/deploy")
async def trigger_deploy(x_deploy_token: str = Header(None)):
    """
    CI/CD deployment endpoint.
    Triggers a deployment script when called with the correct token.
    """
    if not settings.deploy_token or x_deploy_token != settings.deploy_token:
        raise HTTPException(status_code=401, detail="Invalid deploy token")

    try:
        # Execute deployment script
        subprocess.Popen(
            ["bash", "/app/scripts/deploy.sh"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        return {"status": "deployment triggered"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Deployment failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
