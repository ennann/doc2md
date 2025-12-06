# Doc2MD Architecture Overview

## System Design

Doc2MD is built with a privacy-first, queue-based architecture that ensures:
- **Zero file persistence** - No files are saved to disk permanently
- **Stateless backend** - Horizontally scalable API servers
- **Asynchronous processing** - Worker pool handles CPU-intensive conversions
- **Temporary storage only** - Redis stores data with TTL (5 minutes)

## Technology Stack

### Frontend (apps/frontend)
- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: CSS (vanilla)
- **i18n**: Built-in Next.js i18n support
- **Languages**: English, Chinese, Japanese, French, German
- **Deployment**: Vercel

### Backend API (apps/backend)
- **Framework**: FastAPI
- **Language**: Python 3.11
- **Queue**: Redis + RQ (Redis Queue)
- **Validation**: Pydantic
- **Deployment**: Docker

### Worker Service (apps/worker)
- **Framework**: Python RQ Worker
- **Conversion Engine**: Microsoft MarkItDown
- **Language**: Python 3.11
- **Deployment**: Docker (multiple replicas)

### Infrastructure
- **Queue & Cache**: Redis 7
- **Container Orchestration**: Docker Compose
- **Monorepo**: TurboRepo
- **CI/CD**: GitHub Actions

## Data Flow

```
1. User uploads file → Frontend (Next.js)
   ↓
2. Frontend sends multipart/form-data → Backend API (FastAPI)
   ↓
3. Backend receives file bytes → Generates task_id
   ↓
4. Store file bytes in Redis (key: file:{task_id}, TTL: 5min)
   ↓
5. Enqueue job to RQ → Worker picks up job
   ↓
6. Worker converts with MarkItDown → Stores markdown in Redis
   ↓
7. Frontend polls task status → Gets markdown
   ↓
8. Browser downloads markdown → Redis auto-expires after TTL
```

## Privacy Features

1. **No Disk Storage**: Files are never written to permanent storage
2. **Memory/Redis Only**: Files exist only in memory and Redis temporarily
3. **Auto-Expiration**: All Redis keys have 5-minute TTL
4. **No Logging**: File contents are never logged
5. **Immediate Cleanup**: Worker deletes file bytes after processing

## Scaling Strategy

### Horizontal Scaling
- **Frontend**: Vercel handles auto-scaling
- **Backend API**: Stateless - can run multiple instances
- **Workers**: Scale via `docker compose up --scale worker=N`
- **Redis**: Single instance (can be clustered for production)

### Performance
- **Queue-based**: Non-blocking API responses
- **Worker Pool**: Multiple workers process conversions in parallel
- **TTL Strategy**: Auto-cleanup prevents memory bloat
- **Lightweight**: Markdown is plain text, minimal storage needs

## Security

1. **File Type Validation**: Only allowed extensions accepted
2. **Size Limits**: 10MB max file size (configurable)
3. **CORS**: Strict origin whitelist
4. **Deploy Token**: Protected deployment endpoint
5. **HTTPS**: Enforced in production

## Multi-language Support

Next.js 15 provides built-in i18n routing:

- `/en/` - English
- `/zh/` - Chinese (中文)
- `/ja/` - Japanese (日本語)
- `/fr/` - French (Français)
- `/de/` - German (Deutsch)

Translations are stored in `apps/frontend/src/locales/*.json`

## Deployment

### Development
```bash
./scripts/dev.sh  # Starts backend, worker, Redis
cd apps/frontend && pnpm dev  # Starts frontend
```

### Production
```bash
# Backend (Docker)
./scripts/deploy.sh

# Frontend (Vercel)
cd apps/frontend && vercel --prod
```

### CI/CD
GitHub Actions triggers deployment via webhook:
1. Push to `main` branch
2. GitHub Actions calls `/deploy` endpoint
3. Server pulls code and rebuilds containers

## File Structure

```
doc2md/
├── apps/
│   ├── frontend/              Next.js 15 app
│   │   ├── src/
│   │   │   ├── app/          App router
│   │   │   ├── components/   React components
│   │   │   ├── lib/          Utilities & API
│   │   │   ├── locales/      i18n translations
│   │   │   └── types/        TypeScript types
│   │   ├── next.config.ts    Next.js config
│   │   └── package.json
│   │
│   ├── backend/              FastAPI server
│   │   ├── app/
│   │   │   ├── main.py       API routes
│   │   │   ├── config.py     Settings
│   │   │   ├── models.py     Pydantic models
│   │   │   └── redis_client.py
│   │   ├── Dockerfile
│   │   └── requirements.txt
│   │
│   └── worker/               RQ worker
│       ├── worker/
│       │   ├── tasks.py      Conversion logic
│       │   └── config.py
│       ├── run_worker.py     Worker entry point
│       ├── Dockerfile
│       └── requirements.txt
│
├── packages/
│   └── shared/               Shared types
│
├── scripts/
│   ├── dev.sh               Development setup
│   ├── deploy.sh            Production deployment
│   ├── clean.sh             Cleanup
│   └── logs.sh              View logs
│
├── docker-compose.yml        Service orchestration
├── turbo.json               TurboRepo config
└── README.md
```

## MarkItDown Integration

Microsoft's MarkItDown library handles conversion:

```python
from markitdown import MarkItDown

md_converter = MarkItDown()
result = md_converter.convert('/path/to/file.docx')
markdown = result.text_content
```

### Supported Formats
- DOCX, DOC - Microsoft Word
- PDF - Portable Document Format
- PPTX - PowerPoint presentations
- XLSX - Excel spreadsheets
- HTML - Web pages

### Dependencies
- `markitdown` - Core library
- `poppler-utils` - PDF support
- `libpoppler-cpp-dev` - PDF rendering

## Future Enhancements

Potential features to add:
- Rate limiting per IP
- User accounts and quotas
- Webhook callbacks for completion
- VIP queue priority
- Support for more formats (images with OCR)
- Batch conversion
- API key authentication
- WebSocket for real-time updates
