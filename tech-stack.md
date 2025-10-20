# Tech Stack

This document defines the technology stack for the AI Summarization Proxy API project.

## Core Technologies

### Runtime & Language
- **Node.js** `v22.x` (LTS) - JavaScript runtime environment
- **TypeScript** `v5.7.x` - Typed superset of JavaScript for type safety and better developer experience

### Web Framework
- **Express.js** `v4.21.x` - Fast, unopinionated web framework for Node.js
  - Middleware support for request/response handling
  - Routing capabilities
  - Wide ecosystem support

## API & LLM Integration

### LLM Provider
- **Hugging Face Inference API** - For text summarization using open-source models
  - **@huggingface/inference** `v2.x` - Official Hugging Face JavaScript library
  - Primary models: 
    - `facebook/bart-large-cnn` - Optimized for summarization
    - `google/pegasus-xsum` - Extreme summarization
    - `mistralai/Mistral-7B-Instruct-v0.2` - General purpose instruction model
  - Requires: `HUGGINGFACE_API_TOKEN` environment variable
  - Alternative: Self-hosted models using Hugging Face Transformers.js

### API Utilities
- **Axios** `v1.7.x` - HTTP client for external API calls (if needed)

## Development Tools

### Code Quality
- **ESLint** `v9.x` - JavaScript/TypeScript linter
  - `@typescript-eslint/parser`
  - `@typescript-eslint/eslint-plugin`
- **Prettier** `v3.x` - Code formatter
- **tsx** `v4.x` - TypeScript execution and REPL for Node.js (development)
- **ts-node** `v10.x` - TypeScript execution environment

### Build Tools
- **TypeScript Compiler** (`tsc`) - Transpile TypeScript to JavaScript
- **tsup** `v8.x` or **esbuild** `v0.24.x` - Fast bundler (optional, for production builds)

## Validation & Schema

### Request/Response Validation
- **Zod** `v3.x` - TypeScript-first schema validation
  - Type-safe API contracts
  - Runtime validation
  - Automatic type inference

### Alternative Options
- **Joi** `v17.x` - Schema validation library
- **class-validator** with **class-transformer** - Decorator-based validation

## Environment & Configuration

### Environment Management
- **dotenv** `v16.x` - Load environment variables from `.env` file
- **dotenv-expand** `v11.x` - Variable expansion support

### Configuration
- **config** package or custom configuration module
- Environment-specific configs (development, staging, production)

## Testing (Future Implementation)

### Testing Framework
- **Jest** `v29.x` - JavaScript testing framework
  - `ts-jest` - TypeScript preprocessor
  - `@types/jest` - TypeScript definitions
- **Supertest** `v7.x` - HTTP assertion library for API testing

### Alternative
- **Vitest** `v2.x` - Fast Vite-powered test framework

## Logging & Monitoring

### Logging
- **Winston** `v3.x` - Versatile logging library
  - Multiple transports (console, file, cloud)
  - Log levels and formatting
- **Morgan** `v1.x` - HTTP request logger middleware

### Alternative
- **Pino** `v9.x` - Ultra-fast JSON logger

## Security & Validation

### Security Middleware
- **Helmet** `v8.x` - Security headers middleware
- **express-rate-limit** `v7.x` - Rate limiting middleware
- **cors** `v2.x` - Cross-Origin Resource Sharing middleware

### Input Sanitization
- **express-validator** `v7.x` - Validation middleware
- **validator** `v13.x` - String validation and sanitization

## Extended Features (Phase 2)

### Database (for persistence)
- **PostgreSQL** `v16.x` with **Prisma** `v6.x` ORM
  - Type-safe database client
  - Migration system
  - Schema modeling
- Alternative: **MongoDB** with **Mongoose** `v8.x`

### File Processing
- **Multer** `v1.x` - Multipart/form-data handling for file uploads
- **pdf-parse** `v1.x` - PDF text extraction
- **mammoth** `v1.x` - DOCX to HTML/text conversion

### Audio Processing
- **OpenAI Whisper API** - Speech-to-text transcription
- **fluent-ffmpeg** `v2.x` - Audio file processing
- **@ffmpeg-installer/ffmpeg** - FFmpeg binary

### Caching
- **Redis** `v7.x` with **ioredis** `v5.x` client
  - Response caching
  - Rate limit tracking
  - Session storage

### Analytics
- **Prometheus** client for metrics
- **OpenTelemetry** for observability
- Custom analytics middleware

## Development Workflow

### Package Manager
- **pnpm** `v9.x` (recommended) - Fast, disk-efficient package manager
- Alternative: **npm** `v10.x` or **yarn** `v4.x`

### Version Control
- **Git** - Version control system
- **Husky** `v9.x` - Git hooks
- **lint-staged** `v15.x` - Run linters on staged files

### Code Documentation
- **TSDoc** - TypeScript documentation comments
- **TypeDoc** `v0.26.x` - Documentation generator

## Deployment & Production

### Process Management
- **PM2** `v5.x` - Production process manager
- **nodemon** `v3.x` - Development auto-reload

### Containerization
- **Docker** - Containerization platform
- **Docker Compose** - Multi-container orchestration

### Cloud Platform Options
- **AWS Lambda + API Gateway** (Serverless architecture - recommended)
  - API Gateway for HTTP routing and management
  - Lambda functions for serverless compute
  - CloudWatch for logging and monitoring
- **Vercel** (Serverless functions)
- **Railway** / **Render** (Platform as a Service)
- **Azure Functions + API Management** / **Google Cloud Functions + API Gateway**

## API Documentation & Testing

### Documentation
- **Swagger/OpenAPI** `v3.x`
  - `swagger-ui-express` `v5.x` - Interactive API documentation
  - `swagger-jsdoc` `v6.x` - JSDoc to OpenAPI conversion

### API Testing
- **Postman** - API development and testing platform
- Pre-built Postman collection for endpoint testing

## Version Matrix

| Package | Version | Purpose |
|---------|---------|---------|
| Node.js | 22.x | Runtime |
| TypeScript | 5.7.x | Language |
| Express.js | 4.21.x | Web Framework |
| @huggingface/inference | 2.x | LLM Integration |
| Zod | 3.x | Schema Validation |
| Winston | 3.x | Logging |
| Helmet | 8.x | Security |
| Dotenv | 16.x | Environment Config |

## Installation Commands

```bash
# Initialize project
npm init -y

# Install core dependencies
npm install express dotenv @huggingface/inference zod winston morgan helmet cors express-rate-limit

# Install TypeScript and development dependencies
npm install -D typescript @types/node @types/express tsx ts-node eslint prettier @typescript-eslint/parser @typescript-eslint/eslint-plugin

# Initialize TypeScript
npx tsc --init
```

## Configuration Files Needed

- `tsconfig.json` - TypeScript configuration
- `.env` - Environment variables (not committed)
- `.env.example` - Environment template
- `.eslintrc.json` - ESLint configuration
- `.prettierrc` - Prettier configuration
- `package.json` - Project dependencies and scripts
- `Dockerfile` - Container configuration (optional)
- `docker-compose.yml` - Multi-container setup (optional)

---

**Last Updated:** October 2025  
**Status:** Initial Version - Core Stack Defined
