# Contributing Guide

Thank you for considering contributing to Doc2MD! This document provides guidelines and instructions for contributing.

## Ways to Contribute

- Report bugs
- Suggest new features
- Improve documentation
- Submit code changes
- Review pull requests
- Answer questions in discussions

## Getting Started

### Prerequisites

- Docker Desktop
- Node.js 18+
- pnpm
- Git
- GitHub account

### Development Setup

1. **Fork the repository**

Click "Fork" on GitHub to create your own copy.

2. **Clone your fork**

```bash
git clone https://github.com/YOUR_USERNAME/doc2md.git
cd doc2md
```

3. **Add upstream remote**

```bash
git remote add upstream https://github.com/ORIGINAL_OWNER/doc2md.git
```

4. **Install dependencies**

```bash
cd apps/frontend
pnpm install
```

5. **Start development environment**

```bash
# Terminal 1: Backend services
./scripts/dev.sh

# Terminal 2: Frontend
cd apps/frontend
pnpm dev
```

## Contribution Workflow

### 1. Create a Branch

```bash
git checkout main
git pull upstream main
git checkout -b feature/your-feature-name
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation
- `refactor/` - Code refactoring
- `test/` - Test improvements

### 2. Make Changes

- Write clean, readable code
- Follow existing code style
- Add comments for complex logic
- Update documentation if needed

### 3. Test Your Changes

```bash
# Frontend
cd apps/frontend
pnpm lint
pnpm build

# Backend
cd apps/backend
# Run manual tests

# Integration test
# Upload test files via UI
```

### 4. Commit Changes

```bash
git add .
git commit -m "feat: add new feature description"
```

Commit message format:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Test changes
- `chore:` - Maintenance tasks

### 5. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 6. Create Pull Request

1. Go to your fork on GitHub
2. Click "Pull Request"
3. Select your branch
4. Fill in PR template
5. Submit

## Code Style Guidelines

### TypeScript/JavaScript

- Use TypeScript for type safety
- Use `const` over `let`
- Use arrow functions
- Use async/await over promises
- 2 spaces indentation
- Single quotes for strings

**Example**:
```typescript
// Good
const convertDocument = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/convert', {
    method: 'POST',
    body: formData,
  });

  return response.json();
};

// Avoid
function convertDocument(file) {
  var formData = new FormData();
  formData.append("file", file);

  return fetch("/convert", {
    method: "POST",
    body: formData
  }).then(function(response) {
    return response.json();
  });
}
```

### Python

- Follow PEP 8
- Use type hints
- 4 spaces indentation
- Docstrings for functions
- Use f-strings for formatting

**Example**:
```python
# Good
def convert_document(task_id: str, filename: str) -> None:
    """
    Convert a document to Markdown.

    Args:
        task_id: Unique task identifier
        filename: Original filename
    """
    result = md_converter.convert(filename)
    store_result(task_id, result.text_content)

# Avoid
def convert_document(task_id, filename):
    result = md_converter.convert(filename)
    store_result(task_id, result.text_content)
```

### CSS

- Use meaningful class names
- Group related styles
- Mobile-first approach
- 2 spaces indentation

## Project Structure

Understanding the codebase:

```
doc2md/
├── apps/
│   ├── frontend/       # Next.js app
│   │   ├── src/
│   │   │   ├── app/           # Pages & layouts
│   │   │   ├── components/    # React components
│   │   │   ├── lib/           # Utilities
│   │   │   ├── locales/       # Translations
│   │   │   └── types/         # TypeScript types
│   │   └── package.json
│   │
│   ├── backend/        # FastAPI server
│   │   ├── app/
│   │   │   ├── main.py        # API routes
│   │   │   ├── config.py      # Configuration
│   │   │   ├── models.py      # Data models
│   │   │   └── redis_client.py
│   │   └── requirements.txt
│   │
│   └── worker/         # RQ worker
│       ├── worker/
│       │   ├── tasks.py       # Job processing
│       │   └── config.py
│       └── requirements.txt
│
├── packages/
│   └── shared/         # Shared code
│
├── scripts/            # Development scripts
├── documents/          # Documentation
└── docker-compose.yml
```

## Adding Features

### Adding a New Language

1. **Add locale to Next.js config**

Edit `apps/frontend/next.config.ts`:
```typescript
i18n: {
  locales: ['en', 'zh', 'ja', 'fr', 'de', 'es'], // Add 'es'
  defaultLocale: 'en',
}
```

2. **Create translation file**

Create `apps/frontend/src/locales/es.json`:
```json
{
  "title": "Doc2MD - Conversor de Documentos",
  ...
}
```

3. **Update TypeScript types**

Edit `apps/frontend/src/types/index.ts`:
```typescript
export type Locale = 'en' | 'zh' | 'ja' | 'fr' | 'de' | 'es';
```

### Adding a New File Format

1. **Update backend validation**

Edit `apps/backend/app/main.py`:
```python
allowed_extensions = [".docx", ".pdf", ".pptx", ".doc", ".xlsx", ".html", ".new_format"]
```

2. **Ensure MarkItDown supports it**

Check if MarkItDown natively supports the format. If not, add custom handler in `apps/worker/worker/tasks.py`.

3. **Update documentation**

- README.md
- documents/USAGE.md
- documents/API.md

### Adding a New API Endpoint

1. **Add route to FastAPI**

Edit `apps/backend/app/main.py`:
```python
@app.get("/new-endpoint")
async def new_endpoint():
    """Endpoint description."""
    return {"data": "value"}
```

2. **Add Pydantic model if needed**

Edit `apps/backend/app/models.py`:
```python
class NewResponse(BaseModel):
    data: str
```

3. **Update API documentation**

Edit `documents/API.md` with new endpoint details.

4. **Add frontend API call**

Edit `apps/frontend/src/lib/api.ts`:
```typescript
export async function callNewEndpoint(): Promise<NewResponse> {
  const response = await fetch(`${API_BASE_URL}/new-endpoint`);
  return response.json();
}
```

## Testing

### Manual Testing Checklist

- [ ] File upload works
- [ ] Conversion completes successfully
- [ ] Download triggers automatically
- [ ] Error handling works
- [ ] All languages accessible
- [ ] Mobile responsive
- [ ] Dark mode (if applicable)

### Test Files

Use various file types for testing:
- Small files (< 1MB)
- Large files (5-10MB)
- Corrupted files
- Different formats (DOCX, PDF, PPTX)
- Files with images
- Files with tables
- Files with special characters

## Documentation

When adding features or making changes:

1. **Update README.md** if user-facing
2. **Update USAGE.md** with instructions
3. **Update API.md** for API changes
4. **Add code comments** for complex logic
5. **Update ARCHITECTURE.md** for design changes

## Pull Request Guidelines

### PR Title Format

Use conventional commits format:

```
feat(frontend): add dark mode support
fix(backend): resolve CORS issue
docs: update installation guide
```

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How to test these changes

## Screenshots
(if applicable)

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] Changes tested locally
```

### Review Process

1. Automated checks run (if configured)
2. Maintainer reviews code
3. Feedback addressed
4. Approved and merged

### After Merge

- Delete your branch
- Pull latest changes from main
- Close related issues

## Reporting Bugs

### Bug Report Template

```markdown
**Describe the bug**
Clear description of the bug

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What should happen

**Screenshots**
If applicable

**Environment**
- OS: [e.g. macOS 12.0]
- Browser: [e.g. Chrome 96]
- Version: [e.g. 1.0.0]

**Additional context**
Any other information
```

## Feature Requests

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
Clear description of the problem

**Describe the solution you'd like**
What you want to happen

**Describe alternatives you've considered**
Alternative solutions

**Additional context**
Any other information
```

## Code of Conduct

### Our Standards

- Be respectful and inclusive
- Welcome newcomers
- Accept constructive criticism
- Focus on what's best for the community
- Show empathy towards others

### Unacceptable Behavior

- Harassment or discrimination
- Trolling or insulting comments
- Personal or political attacks
- Publishing others' private information
- Other unprofessional conduct

## Questions?

- **Documentation**: Check [docs](./USAGE.md)
- **Discussions**: GitHub Discussions
- **Email**: support@doc2md.me
- **Discord**: [Join our server](#)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Featured in README.md (significant contributions)

Thank you for contributing to Doc2MD!
