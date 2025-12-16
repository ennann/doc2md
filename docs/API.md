# API Reference

Complete API documentation for Doc2MD backend.

## Base URL

- **Development**: `http://localhost:8200`
- **Production**: `https://api.doc2md.org`

## Authentication

Currently, no authentication is required for conversion endpoints.

The `/deploy` endpoint requires a secret token via header.

## Rate Limiting

No rate limiting is currently implemented. Consider adding in production.

## Endpoints

### POST /convert

Upload a document for conversion to Markdown.

#### Request

**Headers**:
```
Content-Type: multipart/form-data
```

**Body**:
- `file`: Binary file data (multipart/form-data)

**Supported Formats**:
- `.docx` - Microsoft Word
- `.doc` - Microsoft Word (older)
- `.pdf` - PDF documents
- `.pptx` - PowerPoint presentations
- `.xlsx` - Excel spreadsheets
- `.html` - HTML files

**File Size Limit**: 10MB (configurable)

#### Response

**Success (200 OK)**:
```json
{
  "task_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "queued"
}
```

**Error Responses**:

```json
// 400 Bad Request - Unsupported file type
{
  "detail": "Unsupported file type. Allowed: .docx, .pdf, .pptx, .doc, .xlsx, .html"
}

// 413 Payload Too Large - File too big
{
  "detail": "File size exceeds maximum allowed size"
}

// 422 Unprocessable Entity - No file provided
{
  "detail": [
    {
      "loc": ["body", "file"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

#### Example

**cURL**:
```bash
curl -X POST http://localhost:8200/convert \
  -F "file=@/path/to/document.docx" \
  -H "Accept: application/json"
```

**Python**:
```python
import requests

with open('document.docx', 'rb') as f:
    response = requests.post(
        'http://localhost:8200/convert',
        files={'file': f}
    )

result = response.json()
print(f"Task ID: {result['task_id']}")
```

**JavaScript**:
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await fetch('http://localhost:8200/convert', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log('Task ID:', result.task_id);
```

---

### GET /task/{task_id}

Get the status and result of a conversion task.

#### Request

**Path Parameters**:
- `task_id` (string, required): Task UUID returned from `/convert`

**Headers**: None required

#### Response

**Success - Processing (200 OK)**:
```json
{
  "task_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "processing"
}
```

**Success - Completed (200 OK)**:
```json
{
  "task_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "success",
  "markdown": "# Document Title\n\nYour converted markdown content here..."
}
```

**Success - Failed (200 OK)**:
```json
{
  "task_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "failed",
  "error": "Failed to convert document: Unsupported PDF encryption"
}
```

**Error (404 Not Found)**:
```json
{
  "detail": "Task not found or expired"
}
```

#### Status Values

| Status | Description |
|--------|-------------|
| `queued` | Task is waiting in queue |
| `processing` | Worker is converting the document |
| `success` | Conversion completed successfully |
| `failed` | Conversion failed (see error field) |

#### Example

**cURL**:
```bash
curl http://localhost:8200/task/550e8400-e29b-41d4-a716-446655440000
```

**Python with Polling**:
```python
import requests
import time

task_id = "550e8400-e29b-41d4-a716-446655440000"

while True:
    response = requests.get(f'http://localhost:8200/task/{task_id}')
    result = response.json()

    if result['status'] == 'success':
        print("Conversion completed!")
        print(result['markdown'])
        break
    elif result['status'] == 'failed':
        print(f"Conversion failed: {result['error']}")
        break
    else:
        print(f"Status: {result['status']}")
        time.sleep(2)
```

**JavaScript with Polling**:
```javascript
async function pollTaskStatus(taskId) {
  const maxAttempts = 60;
  let attempts = 0;

  while (attempts < maxAttempts) {
    const response = await fetch(`http://localhost:8200/task/${taskId}`);
    const result = await response.json();

    if (result.status === 'success') {
      return result.markdown;
    } else if (result.status === 'failed') {
      throw new Error(result.error);
    }

    await new Promise(resolve => setTimeout(resolve, 2000));
    attempts++;
  }

  throw new Error('Conversion timeout');
}
```

---

### GET /health

Health check endpoint for monitoring service availability.

#### Request

No parameters required.

#### Response

**Success (200 OK)**:
```json
{
  "status": "ok",
  "redis": "connected"
}
```

**Redis Disconnected (200 OK)**:
```json
{
  "status": "ok",
  "redis": "disconnected"
}
```

#### Example

**cURL**:
```bash
curl http://localhost:8200/health
```

**Monitoring Script**:
```bash
#!/bin/bash
# health-check.sh

response=$(curl -s http://localhost:8200/health)
redis_status=$(echo $response | jq -r '.redis')

if [ "$redis_status" != "connected" ]; then
    echo "WARNING: Redis is disconnected!"
    # Send alert
fi
```

---

### POST /deploy

Trigger deployment of the application. Protected by secret token.

#### Request

**Headers**:
```
X-Deploy-Token: your-secret-token
```

**Body**: None

#### Response

**Success (200 OK)**:
```json
{
  "status": "deployment triggered"
}
```

**Error (401 Unauthorized)**:
```json
{
  "detail": "Invalid deploy token"
}
```

**Error (500 Internal Server Error)**:
```json
{
  "detail": "Deployment failed: [error message]"
}
```

#### Example

**cURL**:
```bash
curl -X POST http://localhost:8200/deploy \
  -H "X-Deploy-Token: your-secret-token"
```

**GitHub Actions**:
```yaml
- name: Trigger deployment
  run: |
    curl -X POST \
      -H "X-Deploy-Token: ${{ secrets.DEPLOY_TOKEN }}" \
      ${{ secrets.DEPLOY_URL }}/deploy
```

---

## WebSocket Support

Currently not implemented. Tasks are polled via REST API.

Future enhancement: WebSocket for real-time status updates.

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Invalid token |
| 404 | Not Found - Task not found or expired |
| 413 | Payload Too Large - File too big |
| 422 | Unprocessable Entity - Validation error |
| 500 | Internal Server Error - Server error |

---

## CORS

CORS is configured to allow requests from specified origins.

**Allowed Origins** (configurable via `ALLOWED_ORIGINS`):
- `http://localhost:3000` (development)
- Your production domain(s)

**Allowed Methods**: All methods (GET, POST, OPTIONS, etc.)

**Allowed Headers**: All headers

---

## API Limitations

### Current Limitations

1. **File Size**: 10MB maximum (configurable)
2. **Rate Limiting**: None (add in production)
3. **Authentication**: None (add for production)
4. **Concurrent Requests**: Limited by worker count
5. **Task TTL**: 5 minutes (results expire)

### Recommended Production Enhancements

1. **Rate Limiting**
   - Per-IP limits
   - API key quotas
   - Token bucket algorithm

2. **Authentication**
   - API keys
   - OAuth2
   - JWT tokens

3. **Pagination**
   - For future task listing endpoints

4. **Versioning**
   - API version in URL: `/v1/convert`

---

## Client Libraries

### Python Client

```python
import requests
import time

class Doc2MDClient:
    def __init__(self, base_url='http://localhost:8200'):
        self.base_url = base_url

    def convert(self, file_path, timeout=120):
        """Convert a document to markdown."""
        with open(file_path, 'rb') as f:
            response = requests.post(
                f'{self.base_url}/convert',
                files={'file': f}
            )
            response.raise_for_status()
            task_id = response.json()['task_id']

        return self.wait_for_result(task_id, timeout)

    def wait_for_result(self, task_id, timeout=120):
        """Poll for task completion."""
        start_time = time.time()

        while time.time() - start_time < timeout:
            response = requests.get(f'{self.base_url}/task/{task_id}')
            response.raise_for_status()
            result = response.json()

            if result['status'] == 'success':
                return result['markdown']
            elif result['status'] == 'failed':
                raise Exception(result['error'])

            time.sleep(2)

        raise TimeoutError('Conversion timeout')

    def health(self):
        """Check service health."""
        response = requests.get(f'{self.base_url}/health')
        return response.json()

# Usage
client = Doc2MDClient('http://localhost:8200')
markdown = client.convert('document.docx')
print(markdown)
```

### JavaScript/TypeScript Client

```typescript
class Doc2MDClient {
  constructor(private baseUrl: string = 'http://localhost:8200') {}

  async convert(file: File, timeout: number = 120000): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseUrl}/convert`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const { task_id } = await response.json();
    return this.waitForResult(task_id, timeout);
  }

  private async waitForResult(taskId: string, timeout: number): Promise<string> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const response = await fetch(`${this.baseUrl}/task/${taskId}`);
      const result = await response.json();

      if (result.status === 'success') {
        return result.markdown;
      } else if (result.status === 'failed') {
        throw new Error(result.error);
      }

      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    throw new Error('Conversion timeout');
  }

  async health(): Promise<{ status: string; redis: string }> {
    const response = await fetch(`${this.baseUrl}/health`);
    return response.json();
  }
}

// Usage
const client = new Doc2MDClient('http://localhost:8200');
const markdown = await client.convert(fileInput.files[0]);
console.log(markdown);
```

---

## OpenAPI Documentation

Interactive API documentation is available at:

- **Swagger UI**: http://localhost:8200/docs
- **ReDoc**: http://localhost:8200/redoc
- **OpenAPI JSON**: http://localhost:8200/openapi.json

---

## Testing

### Unit Tests

```bash
# Backend tests
cd apps/backend
pytest
```

### Integration Tests

```bash
# Test full conversion flow
curl -X POST http://localhost:8200/convert \
  -F "file=@test.docx" \
  | jq -r '.task_id' \
  | xargs -I {} curl http://localhost:8200/task/{}
```

### Load Testing

```bash
# Using Apache Bench
ab -n 100 -c 10 http://localhost:8200/health

# Using hey
hey -n 100 -c 10 http://localhost:8200/health
```

---

## Support

For issues or questions:
- Check [Usage Guide](./USAGE.md)
- Open GitHub issue
- Email: support@doc2md.org
