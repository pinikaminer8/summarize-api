# AI Summarization Proxy API - Running Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and update with your values:
```bash
cp .env.example .env
```

Required variables:
- `HUGGINGFACE_API_TOKEN` - Your Hugging Face API token
- `PORT` - Server port (default: 3000)
- `HUGGINGFACE_MODEL` - Model to use (default: facebook/bart-large-cnn)

### 3. Start the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm run build
npm start
```

### 4. Test the API

**Health Check:**
```bash
curl http://localhost:3000/health
```

**Summarize Text:**
```bash
curl -X POST http://localhost:3000/api/summarize \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Artificial intelligence is transforming technology. Machine learning enables computers to learn from data and improve over time without being explicitly programmed. This revolution is changing industries worldwide."
  }'
```

## Available Scripts

- `npm run dev` - Start development server with auto-reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run type-check` - Check TypeScript types
- `npm run test:huggingface` - Test Hugging Face connection
- `npm run test:summarization` - Test summarization logic

## API Endpoints

### POST /api/summarize

Generate a summary with title, keywords, and sentiment.

**Request:**
```json
{
  "text": "Your text here (10-10,000 characters)"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "title": "Generated title",
    "summary": "Generated summary",
    "keywords": ["keyword1", "keyword2"],
    "sentiment": "positive"
  },
  "metadata": {
    "processingTimeMs": 2341,
    "inputLength": 287,
    "model": "facebook/bart-large-cnn"
  }
}
```

### GET /health

Check server health status.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-20T12:00:00.000Z",
  "uptime": 123.456
}
```

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 3000 | Server port |
| NODE_ENV | development | Environment mode |
| CORS_ORIGIN | * | CORS allowed origins |
| HUGGINGFACE_API_TOKEN | - | HuggingFace API token (required) |
| HUGGINGFACE_MODEL | facebook/bart-large-cnn | Model for summarization |
| RATE_LIMIT_WINDOW_MS | 900000 | Rate limit window (15 min) |
| RATE_LIMIT_MAX_REQUESTS | 100 | Max requests per window |
| MAX_INPUT_LENGTH | 10000 | Max input text length |
| REQUEST_TIMEOUT_MS | 5000 | Request timeout (5 sec) |

## Troubleshooting

### Server won't start
- Check if the port is already in use
- Verify `HUGGINGFACE_API_TOKEN` is set in `.env`
- Run `npm install` to ensure all dependencies are installed

### Request timeout errors
- Increase `REQUEST_TIMEOUT_MS` in `.env`
- Check your internet connection
- Verify Hugging Face API is accessible

### Rate limit errors
- Adjust `RATE_LIMIT_MAX_REQUESTS` in `.env`
- Wait 15 minutes before retrying
- Consider implementing user-based rate limiting

## Development

### Project Structure
```
src/
├── index.ts              # Express app entry point
├── routes/               # API route definitions
├── controllers/          # Request handlers
├── services/             # Business logic
├── middleware/           # Express middleware
├── schemas/              # Zod validation schemas
├── types/                # TypeScript type definitions
├── utils/                # Utility functions
├── config/               # Configuration files
├── constants/            # Application constants
└── scripts/              # Test scripts
```

### Adding New Features

1. Update TypeScript types in `src/types/`
2. Add validation schemas in `src/schemas/`
3. Implement business logic in `src/services/`
4. Create controller in `src/controllers/`
5. Define routes in `src/routes/`
6. Update API documentation

## Logs

Logs are stored in the `logs/` directory:
- `combined.log` - All logs
- `error.log` - Error logs only

## Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Build the application: `npm run build`
3. Start the server: `npm start`
4. Consider using a process manager like PM2:
   ```bash
   npm install -g pm2
   pm2 start dist/index.js --name summarize-api
   ```

## Support

For issues and questions, please refer to:
- API Contract: See `API-CONTRACT.md`
- Tech Stack: See `tech-stack.md`
- Tasks: See `tasks.md`
