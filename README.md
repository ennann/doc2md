# Doc2MD

> Privacy-first document to Markdown converter. No file storage, no tracking.

Convert your documents (DOCX, PDF, PPTX, XLSX, HTML) to clean Markdown format instantly.

## Features

- ✅ **Privacy First** - No files stored on server
- ✅ **Multiple Formats** - DOCX, PDF, PPTX, XLSX, HTML
- ✅ **Multi-language** - English, Chinese, Japanese, French, German
- ✅ **Fast & Scalable** - Queue-based processing
- ✅ **Open Source** - Built with Next.js 15, FastAPI, Redis

## Quick Start

```bash
# Start backend and frontend services
./scripts/dev.sh
```

Visit http://localhost:3000

## Documentation

- [Usage Guide](./documents/USAGE.md) - Detailed instructions
- [Architecture](./documents/ARCHITECTURE.md) - System design
- [API Reference](./documents/API.md) - API endpoints

## Technology Stack

**Frontend:** Next.js 15, React 19, TypeScript
**Backend:** FastAPI, Python 3.11
**Worker:** Python RQ, Microsoft MarkItDown
**Infrastructure:** Redis, Docker, TurboRepo

## License

MIT License - see [LICENSE](./LICENSE) file for details

## Support

If you find this project helpful, consider buying me a coffee!

[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-support-yellow.svg?style=flat&logo=buy-me-a-coffee)](https://buymeacoffee.com/yourusername)

## Contributing

Contributions are welcome! Please check out our [Contributing Guide](./documents/CONTRIBUTING.md).
