# Usage Guide

Complete guide for setting up, running, and deploying Doc2MD.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Development](#development)
- [Production Deployment](#production-deployment)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)
- [Advanced Usage](#advanced-usage)

## Prerequisites

### Required

- **Docker Desktop** - For running backend services
  - Download from [docker.com](https://www.docker.com/products/docker-desktop)
  - Minimum version: 20.10+

- **Node.js** - For frontend development
  - Version: 18.0.0 or higher
  - Download from [nodejs.org](https://nodejs.org/)

- **pnpm** - Package manager
  ```bash
  npm install -g pnpm
  ```

### Optional

- **Git** - For version control
- **VS Code** - Recommended editor

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/doc2md.git
cd doc2md
```

### 2. Install Dependencies

```bash
# Frontend dependencies
cd apps/frontend
pnpm install
cd ../..
```

Backend dependencies are installed via Docker, no manual installation needed.

### 3. Setup Environment Files

Environment files are automatically created from examples when you run `./scripts/dev.sh`.

To create them manually:

```bash
# Backend
cp apps/backend/.env.example apps/backend/.env

# Worker
cp apps/worker/.env.example apps/worker/.env

# Frontend
cp apps/frontend/.env.example apps/frontend/.env.local
```

## Development

### Starting the Application

#### Method 1: Using the Dev Script (Recommended)

```bash
# Make scripts executable (first time only)
chmod +x scripts/*.sh

# Start all backend services
./scripts/dev.sh
```

This will start:
- Redis (port 6380)
- Backend API (port 8100)
- Worker (2 instances)

#### Method 2: Manual Start

```bash
# Start backend services
docker compose up -d

# Check services are running
docker compose ps
```

### Starting the Frontend

In a new terminal:

```bash
cd apps/frontend
pnpm dev
```

Frontend will be available at http://localhost:3000

### Accessing Services

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8100
- **API Documentation**: http://localhost:8100/docs
- **Redis**: localhost:6380

### Multi-language Access

The application supports 5 languages with automatic routing:

- **English**: http://localhost:3000/en
- **Chinese**: http://localhost:3000/zh
- **Japanese**: http://localhost:3000/ja
- **French**: http://localhost:3000/fr
- **German**: http://localhost:3000/de

## Using the Application

### 1. Upload a Document

1. Visit http://localhost:3000
2. Click "Choose File" button
3. Select a document (DOCX, PDF, PPTX, XLSX, or HTML)
4. Click upload

### 2. Conversion Process

The application will:
1. Upload file to backend
2. Queue conversion job
3. Process document with MarkItDown
4. Auto-download Markdown file when complete

### 3. Supported Formats

| Format | Extension | Description |
|--------|-----------|-------------|
| Word | `.docx`, `.doc` | Microsoft Word documents |
| PDF | `.pdf` | Portable Document Format |
| PowerPoint | `.pptx` | Microsoft PowerPoint presentations |
| Excel | `.xlsx` | Microsoft Excel spreadsheets |
| HTML | `.html` | Web pages |

## Production Deployment

### Backend Deployment

#### Prerequisites

- Linux server with Docker installed
- Domain name configured
- SSL certificate (recommended)

#### Steps

1. **Clone repository on server**:

```bash
ssh user@yourserver.com
git clone https://github.com/yourusername/doc2md.git
cd doc2md
```

2. **Configure environment variables**:

```bash
nano apps/backend/.env
```

```env
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_DB=0
TASK_TTL=300
DEPLOY_TOKEN=your-strong-secret-token-here
ALLOWED_ORIGINS=https://doc2md.org,https://www.doc2md.org
```

3. **Run deployment**:

```bash
./scripts/deploy.sh
```

4. **Setup reverse proxy** (Nginx example):

```nginx
server {
    listen 80;
    server_name api.doc2md.org;

    location / {
        proxy_pass http://localhost:8100;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

5. **Setup SSL** with Let's Encrypt:

```bash
sudo certbot --nginx -d api.doc2md.org
```

### Frontend Deployment (Vercel)

#### Using Vercel CLI

1. **Install Vercel CLI**:

```bash
npm install -g vercel
```

2. **Deploy**:

```bash
cd apps/frontend
vercel --prod
```

#### Using Vercel Dashboard

1. Connect your GitHub repository to Vercel
2. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/frontend`
   - **Build Command**: `pnpm build`
   - **Output Directory**: `.next`

3. Add environment variable:
   - `NEXT_PUBLIC_API_URL`: `https://api.doc2md.org`

4. Deploy

### CI/CD Setup

#### GitHub Actions

1. **Add secrets to GitHub repository**:
   - `DEPLOY_TOKEN`: Your deploy token
   - `DEPLOY_URL`: Your backend API URL (e.g., `https://api.doc2md.org`)

2. **Push to main branch** to trigger automatic deployment:

```bash
git push origin main
```

The workflow is already configured in `.github/workflows/deploy.yml`.

## Configuration

### Backend Configuration

File: `apps/backend/.env`

```env
# Redis Configuration
REDIS_HOST=redis                    # Redis host (use 'localhost' for local dev)
REDIS_PORT=6379                     # Redis port
REDIS_DB=0                          # Redis database number

# Task Configuration
TASK_TTL=300                        # Task TTL in seconds (5 minutes)

# Security
DEPLOY_TOKEN=your-secret-token      # Token for deployment endpoint
ALLOWED_ORIGINS=http://localhost:3000,https://doc2md.org  # CORS origins

# Optional
MAX_FILE_SIZE=10485760              # Max file size in bytes (10MB)
```

### Frontend Configuration

File: `apps/frontend/.env.local`

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8100  # Use https://api.doc2md.org in production
```

### Worker Configuration

File: `apps/worker/.env`

```env
# Redis Configuration
REDIS_HOST=redis                    # Redis host
REDIS_PORT=6379                     # Redis port
REDIS_DB=0                          # Redis database number
```

### Docker Compose Configuration

File: `docker-compose.yml`

#### Scaling Workers

To run multiple worker instances:

```yaml
worker:
  # ...
  deploy:
    replicas: 4  # Change this number
```

Or use command:

```bash
docker compose up -d --scale worker=4
```

#### Memory Limits

Add resource limits:

```yaml
services:
  backend:
    # ...
    deploy:
      resources:
        limits:
          memory: 512M
```

## Useful Commands

### Viewing Logs

```bash
# All services
./scripts/logs.sh

# Specific service
./scripts/logs.sh backend
./scripts/logs.sh worker
./scripts/logs.sh redis
```

### Service Management

```bash
# Restart all services
docker compose restart

# Restart specific service
docker compose restart backend
docker compose restart worker

# Stop all services
docker compose down

# Stop and remove volumes
docker compose down -v
```

### Cleanup

```bash
# Clean all Docker resources
./scripts/clean.sh

# Or manually
docker compose down --rmi all --volumes
docker system prune -af
```

### Database Management

```bash
# Access Redis CLI
docker exec -it doc2md-redis redis-cli

# View all keys
docker exec -it doc2md-redis redis-cli KEYS '*'

# Flush all data
docker exec -it doc2md-redis redis-cli FLUSHALL
```

## Troubleshooting

### Common Issues

#### 1. Docker not running

**Error**: `Cannot connect to the Docker daemon`

**Solution**: Start Docker Desktop

#### 2. Port already in use

**Error**: `Port 8000 is already allocated`

**Solution**:
- Stop the service using that port
- Or change port in `docker-compose.yml`:

```yaml
backend:
  ports:
    - "8001:8000"  # Change external port
```

#### 3. Redis connection failed

**Error**: `Connection refused to Redis`

**Solution**:
```bash
# Check Redis is running
docker compose ps redis

# Restart Redis
docker compose restart redis

# Check logs
./scripts/logs.sh redis
```

#### 4. Worker not processing

**Symptoms**: Tasks stuck in "processing" state

**Solution**:
```bash
# Check worker logs
./scripts/logs.sh worker

# Restart worker
docker compose restart worker

# Check Redis queue
docker exec -it doc2md-redis redis-cli LLEN rq:queue:default
```

#### 5. Frontend build errors

**Error**: Module not found or build failures

**Solution**:
```bash
cd apps/frontend
rm -rf .next node_modules
pnpm install
pnpm dev
```

#### 6. File conversion fails

**Error**: "Conversion failed" message

**Possible causes**:
- Unsupported file format
- Corrupted file
- File too large
- Missing dependencies in worker

**Check worker logs**:
```bash
./scripts/logs.sh worker
```

### Performance Issues

#### Slow conversion

**Solutions**:
- Scale worker instances: `docker compose up -d --scale worker=4`
- Increase worker resources in `docker-compose.yml`
- Check Redis memory usage

#### High memory usage

**Solutions**:
- Reduce `TASK_TTL` to clean up faster
- Add memory limits in `docker-compose.yml`
- Scale horizontally instead of vertically

## Advanced Usage

### Custom Domain Configuration

#### Backend with Nginx

```nginx
server {
    server_name api.doc2md.org;

    location / {
        proxy_pass http://localhost:8100;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # File upload size limit
    client_max_body_size 20M;
}
```

### API Testing with curl

#### Upload a file

```bash
curl -X POST http://localhost:8100/convert \
  -F "file=@/path/to/document.docx" \
  -H "Accept: application/json"
```

Response:
```json
{
  "task_id": "abc-123-def-456",
  "status": "queued"
}
```

#### Check task status

```bash
curl http://localhost:8100/task/abc-123-def-456
```

Response:
```json
{
  "task_id": "abc-123-def-456",
  "status": "success",
  "markdown": "# Document Title\n\nContent here..."
}
```

#### Health check

```bash
curl http://localhost:8100/health
```

Response:
```json
{
  "status": "ok",
  "redis": "connected"
}
```

### Monitoring

#### Check service status

```bash
docker compose ps
```

#### Monitor resource usage

```bash
docker stats
```

#### Monitor Redis

```bash
# Connect to Redis CLI
docker exec -it doc2md-redis redis-cli

# Check queue length
LLEN rq:queue:default

# Monitor commands in real-time
MONITOR

# Check memory usage
INFO memory
```

### Backup and Restore

#### Backup Redis data

```bash
docker exec doc2md-redis redis-cli SAVE
docker cp doc2md-redis:/data/dump.rdb ./backup/
```

#### Restore Redis data

```bash
docker cp ./backup/dump.rdb doc2md-redis:/data/
docker compose restart redis
```

### Custom Worker Configuration

#### Add environment variables

Edit `apps/worker/worker/config.py`:

```python
CUSTOM_SETTING = os.getenv("CUSTOM_SETTING", "default_value")
```

Update `docker-compose.yml`:

```yaml
worker:
  environment:
    - CUSTOM_SETTING=my_value
```

#### Modify conversion logic

Edit `apps/worker/worker/tasks.py` to customize how documents are processed.

### Extending Supported Formats

To add support for new file formats:

1. Update `apps/backend/app/main.py`:
```python
allowed_extensions = [".docx", ".pdf", ".pptx", ".doc", ".xlsx", ".html", ".new_format"]
```

2. Ensure MarkItDown supports the format or add custom handler in `apps/worker/worker/tasks.py`

## Getting Help

- **Documentation**: Check [Architecture](./ARCHITECTURE.md) and [API Reference](./API.md)
- **Issues**: Open an issue on GitHub
- **Discussions**: Join GitHub Discussions
- **Email**: support@doc2md.org

## Next Steps

- Customize the UI in `apps/frontend/src/components/`
- Add authentication for user accounts
- Implement rate limiting
- Add WebSocket for real-time updates
- Set up monitoring with Prometheus/Grafana
