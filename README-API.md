# AI Summarization Proxy API

An HTTP API that generates AI-powered summaries with title, keywords, and sentiment analysis using Hugging Face models.

## Features

- 🤖 **AI-Powered Summarization** - Uses facebook/bart-large-cnn model
- 📊 **Sentiment Analysis** - Detects positive, negative, or neutral sentiment
- 🔑 **Keyword Extraction** - Identifies key terms from text
- 📝 **Title Generation** - Creates concise titles
- ⚡ **Fast & Efficient** - Sub-5 second response times
- 🛡️ **Production Ready** - Rate limiting, error handling, logging
- 📖 **Well Documented** - OpenAPI/Postman collections

## Quick Start

### Prerequisites

- Node.js 22.x or later
- Hugging Face API token ([get one here](https://huggingface.co/settings/tokens))

### Installation

```bash
# Clone the repository
git clone https://github.com/pinikaminer8/summarize-api.git
cd summarize-api

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env and add your HUGGINGFACE_API_TOKEN
```

### Running the Server

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm run build
npm start
```

The server will start on `http://localhost:3000`

## API Usage

### POST /api/summarize

Generate a summary from text.

**Request:**
```bash
curl -X POST http://localhost:3000/api/summarize \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Your text here (10-10,000 characters)"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "title": "Generated Title",
    "summary": "Concise summary of the text...",
    "keywords": ["keyword1", "keyword2", "keyword3"],
    "sentiment": "positive"
  },
  "metadata": {
    "processingTimeMs": 2341,
    "inputLength": 198,
    "model": "facebook/bart-large-cnn"
  }
}
```

### GET /health

Check server health.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-20T12:00:00.000Z",
  "uptime": 123.456
}
```

## Documentation

- **[API Contract](./API-CONTRACT.md)** - Complete API specification
- **[Running Guide](./RUNNING.md)** - Detailed setup and configuration
- **[Error Handling](./ERROR-HANDLING.md)** - Error codes and troubleshooting
- **[Tech Stack](./tech-stack.md)** - Technologies used
- **[Postman Collection](./postman-collection.json)** - Import into Postman for testing

## Configuration

Configure via environment variables in `.env`:

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3000 | Server port |
| `NODE_ENV` | development | Environment mode |
| `HUGGINGFACE_API_TOKEN` | - | HuggingFace API token (required) |
| `HUGGINGFACE_MODEL` | facebook/bart-large-cnn | Summarization model |
| `REQUEST_TIMEOUT_MS` | 5000 | Request timeout (5 sec) |
| `RATE_LIMIT_MAX_REQUESTS` | 100 | Max requests per window |
| `RATE_LIMIT_WINDOW_MS` | 900000 | Rate limit window (15 min) |

## Testing

```bash
# Test Hugging Face connection
npm run test:huggingface

# Test summarization logic
npm run test:summarization

# Run manual API tests (requires server running)
npm run test:manual
```

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": "Additional error details (dev mode only)"
  }
}
```

**Error Codes:**
- `INVALID_INPUT` (400) - Bad request
- `VALIDATION_ERROR` (422) - Input validation failed
- `RATE_LIMIT_EXCEEDED` (429) - Too many requests
- `INTERNAL_ERROR` (500) - Server error
- `SERVICE_UNAVAILABLE` (503) - HuggingFace API unavailable
- `REQUEST_TIMEOUT` (504) - Request exceeded 5 seconds

See [ERROR-HANDLING.md](./ERROR-HANDLING.md) for details.

## Rate Limiting

- **Limit:** 100 requests per 15 minutes per IP address
- **Headers:** Rate limit info included in response headers
- **Error:** Returns 429 status with retry-after information

## Performance

- **Latency:** ≤ 5 seconds for inputs ≤ 10,000 characters
- **Concurrency:** Handles multiple concurrent requests
- **Timeout:** Automatic timeout after 5 seconds

## Project Structure

```
summarize-api/
├── src/
│   ├── index.ts              # Express app entry point
│   ├── routes/               # API route definitions
│   ├── controllers/          # Request handlers
│   ├── services/             # Business logic (AI/LLM)
│   ├── middleware/           # Express middleware
│   ├── schemas/              # Zod validation schemas
│   ├── types/                # TypeScript types
│   ├── utils/                # Utilities
│   ├── config/               # Configuration
│   ├── constants/            # Constants
│   └── scripts/              # Test scripts
├── logs/                     # Application logs
├── dist/                     # Compiled JavaScript
└── docs/                     # Documentation
```

## Technologies

- **Runtime:** Node.js 22.x
- **Language:** TypeScript 5.7.x
- **Framework:** Express.js 4.21.x
- **AI/LLM:** Hugging Face Inference API
- **Validation:** Zod 3.x
- **Logging:** Winston 3.x
- **Security:** Helmet, CORS, Rate Limiting

See [tech-stack.md](./tech-stack.md) for complete details.

## Development

```bash
# Lint code
npm run lint

# Format code
npm run format

# Type check
npm run type-check

# Build
npm run build
```

## Deployment

### AWS Lambda + API Gateway (Recommended)

See deployment instructions in [RUNNING.md](./RUNNING.md#production-deployment)

### Docker (Optional)

```bash
docker build -t summarize-api .
docker run -p 3000:3000 --env-file .env summarize-api
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

ISC

## Support

For issues and questions:
- Check the [documentation](./RUNNING.md)
- Review [error handling guide](./ERROR-HANDLING.md)
- Open an issue on GitHub

## Roadmap

Future enhancements (post-MVP):
- Authentication & authorization
- Database persistence
- File upload support (PDF, audio)
- Caching layer
- Advanced analytics
- Unit/integration testing

---

**Author:** Pini  
**Repository:** [summarize-api](https://github.com/pinikaminer8/summarize-api)
