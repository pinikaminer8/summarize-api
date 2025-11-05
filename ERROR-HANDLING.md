# Error Handling Documentation

## Overview

The AI Summarization Proxy API implements comprehensive error handling with centralized error middleware, structured logging, and error tracking.

## Error Codes

### Client Errors (4xx)

#### INVALID_INPUT (400)
- **Description**: Invalid input parameters
- **Common Causes**:
  - Missing required fields
  - Invalid data types
  - Empty or whitespace-only text
- **Example Response**:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "Text is required and must not exceed 10,000 characters"
  }
}
```

#### VALIDATION_ERROR (422)
- **Description**: Request validation failed
- **Common Causes**:
  - Text length < 10 characters
  - Text length > 10,000 characters
  - Invalid JSON format
- **Example Response**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": {
      "field": "text",
      "issue": "Text must be at least 10 characters long"
    }
  }
}
```

#### RATE_LIMIT_EXCEEDED (429)
- **Description**: Too many requests from the same IP
- **Limit**: 100 requests per 15 minutes
- **Example Response**:
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "retryAfter": 60
  }
}
```

### Server Errors (5xx)

#### INTERNAL_ERROR (500)
- **Description**: Unexpected server error
- **Common Causes**:
  - Unexpected exceptions
  - Database errors (if implemented)
  - Configuration issues
- **Example Response**:
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred while processing your request"
  }
}
```

#### SERVICE_UNAVAILABLE (503)
- **Description**: Hugging Face API unavailable
- **Common Causes**:
  - Hugging Face API downtime
  - Network connectivity issues
  - Rate limiting from Hugging Face
  - Invalid API token
- **Example Response**:
```json
{
  "success": false,
  "error": {
    "code": "SERVICE_UNAVAILABLE",
    "message": "The summarization service is temporarily unavailable. Please try again later."
  }
}
```

#### REQUEST_TIMEOUT (504)
- **Description**: Request exceeded 5-second timeout
- **Common Causes**:
  - Very long input text
  - Slow Hugging Face API response
  - Network latency
- **Example Response**:
```json
{
  "success": false,
  "error": {
    "code": "REQUEST_TIMEOUT",
    "message": "Request processing exceeded the maximum allowed time of 5 seconds"
  }
}
```

## Error Handling Architecture

### 1. Centralized Error Middleware
Located in `src/middleware/error.middleware.ts`:
- Catches all errors thrown in the application
- Logs errors with context (path, method, body)
- Tracks error statistics
- Returns consistent error responses

### 2. Error Tracking
Located in `src/utils/error-tracker.utils.ts`:
- Tracks error occurrences by code
- Maintains error statistics
- Stores error examples for debugging
- Provides error reporting capabilities

### 3. Structured Logging
Located in `src/utils/logger.utils.ts`:
- Winston-based logging
- Separate files for errors and combined logs
- Request/response logging
- Performance monitoring

### 4. Custom Error Classes
- `AppError`: Base class for application errors
- Factory functions for specific error types:
  - `createValidationError()`
  - `createBadRequestError()`
  - `createTimeoutError()`
  - `createServiceUnavailableError()`

## Logging Levels

### Info
- Configuration validation
- Server startup
- Successful requests
- API call completions

### Warn
- Slow requests (>5 seconds)
- Fallback logic triggered
- Deprecated API usage

### Error
- Request failures
- API errors
- Unexpected exceptions
- Validation failures

## Error Response Format

All errors follow this consistent structure:

```typescript
{
  success: false,
  error: {
    code: string,        // Error code (e.g., "VALIDATION_ERROR")
    message: string,     // Human-readable message
    details?: string | { // Optional additional details (dev mode only)
      field?: string,
      issue?: string
    },
    retryAfter?: number  // Retry delay in seconds (for rate limits)
  }
}
```

## Timeout Handling

### Request Timeout (5 seconds)
- Configured in `REQUEST_TIMEOUT_MS` environment variable
- Applied to all `/api` routes
- Prevents long-running requests from blocking resources
- Returns `REQUEST_TIMEOUT` error if exceeded

### Implementation
Located in `src/middleware/timeout.middleware.ts`:
- Sets timeout on both request and response
- Throws timeout error if limit exceeded
- Ensures consistent timeout behavior

## Performance Monitoring

### Slow Request Detection
- Warns if request duration > 5 seconds
- Logs method, path, duration, and status code
- Helps identify performance bottlenecks

### Metrics Tracked
- Request duration
- Status code distribution
- Error rate by error code
- Endpoint usage patterns

## Error Testing

### Manual Testing
Test error scenarios:
```bash
# Empty text
curl -X POST http://localhost:3000/api/summarize \
  -H "Content-Type: application/json" \
  -d '{"text": ""}'

# Text too short
curl -X POST http://localhost:3000/api/summarize \
  -H "Content-Type: application/json" \
  -d '{"text": "short"}'

# Missing text field
curl -X POST http://localhost:3000/api/summarize \
  -H "Content-Type: application/json" \
  -d '{}'

# Invalid JSON
curl -X POST http://localhost:3000/api/summarize \
  -H "Content-Type: application/json" \
  -d 'invalid json'
```

## Development vs Production

### Development Mode
- Includes error stack traces in responses
- Detailed error messages
- Full error context in logs
- Set `NODE_ENV=development`

### Production Mode
- Generic error messages
- No stack traces
- Limited error details
- Set `NODE_ENV=production`

## Best Practices

1. **Always use AppError for known errors**
   ```typescript
   throw new AppError(400, 'INVALID_INPUT', 'Text is required');
   ```

2. **Use factory functions for common errors**
   ```typescript
   throw createValidationError('Invalid input');
   throw createTimeoutError();
   ```

3. **Include context in error logs**
   ```typescript
   logger.error('API call failed', {
     endpoint: '/api/summarize',
     error: err.message
   });
   ```

4. **Track errors for monitoring**
   ```typescript
   trackError('VALIDATION_ERROR', err.message, { path: req.path });
   ```

## Log Files

- `logs/combined.log` - All logs
- `logs/error.log` - Error logs only
- Rotated at 5MB
- Keeps 5 backup files

## Monitoring Recommendations

1. Monitor error rates by code
2. Track request timeout frequency
3. Monitor slow request warnings
4. Review error logs daily
5. Set up alerts for critical errors (500, 503, 504)
