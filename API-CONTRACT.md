# API Contract - AI Summarization Proxy API

## Base URL
```
http://localhost:3000/api
```

## Endpoints

### POST /api/summarize
Accepts text input and returns a structured summary with title, key points, sentiment, and keywords.

#### Request

**URL:** `POST /api/summarize`

**Headers:**
```
Content-Type: application/json
```

**Request Body Schema:**
```json
{
  "text": "string (required, max 10,000 characters)"
}
```

**Example Request:**
```json
{
  "text": "Artificial intelligence (AI) is intelligence demonstrated by machines, in contrast to the natural intelligence displayed by humans and animals. Leading AI textbooks define the field as the study of intelligent agents: any device that perceives its environment and takes actions that maximize its chance of successfully achieving its goals."
}
```

#### Response

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "title": "string",
    "summary": "string",
    "keywords": ["string"],
    "sentiment": "positive" | "negative" | "neutral"
  },
  "metadata": {
    "processingTimeMs": "number",
    "inputLength": "number",
    "model": "string"
  }
}
```

**Example Success Response:**
```json
{
  "success": true,
  "data": {
    "title": "Understanding Artificial Intelligence",
    "summary": "Artificial intelligence refers to machine-demonstrated intelligence that differs from natural intelligence shown by humans and animals. The field focuses on studying intelligent agents that perceive their environment and take goal-oriented actions.",
    "keywords": ["artificial intelligence", "machines", "intelligent agents", "natural intelligence"],
    "sentiment": "neutral"
  },
  "metadata": {
    "processingTimeMs": 2341,
    "inputLength": 287,
    "model": "facebook/bart-large-cnn"
  }
}
```

## Error Responses

### 400 Bad Request
**Cause:** Invalid input (missing text, empty text, or text exceeds maximum length)

```json
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "Text is required and must not exceed 10,000 characters",
    "details": "string (optional)"
  }
}
```

### 422 Unprocessable Entity
**Cause:** Input validation failed

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": {
      "field": "text",
      "issue": "Required field missing"
    }
  }
}
```

### 429 Too Many Requests
**Cause:** Rate limit exceeded

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

### 500 Internal Server Error
**Cause:** Server or LLM API error

```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred while processing your request",
    "details": "string (in development mode only)"
  }
}
```

### 503 Service Unavailable
**Cause:** LLM service unavailable or timeout

```json
{
  "success": false,
  "error": {
    "code": "SERVICE_UNAVAILABLE",
    "message": "The summarization service is temporarily unavailable. Please try again later."
  }
}
```

### 504 Gateway Timeout
**Cause:** Request exceeded 5-second timeout

```json
{
  "success": false,
  "error": {
    "code": "REQUEST_TIMEOUT",
    "message": "Request processing exceeded the maximum allowed time of 5 seconds"
  }
}
```

## HTTP Status Codes Summary

| Status Code | Description |
|-------------|-------------|
| 200 | Success - Summary generated successfully |
| 400 | Bad Request - Invalid input parameters |
| 422 | Unprocessable Entity - Validation error |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |
| 503 | Service Unavailable - LLM service unavailable |
| 504 | Gateway Timeout - Request timeout (>5s) |

## Request Constraints

- **Maximum text length:** 10,000 characters (~10k tokens)
- **Maximum processing time:** 5 seconds
- **Rate limiting:** 100 requests per 15 minutes per IP
- **Content-Type:** application/json (required)

## Notes

1. All responses follow a consistent structure with `success` boolean flag
2. Error responses include a `code` for programmatic handling
3. The `sentiment` field can only be: "positive", "negative", or "neutral"
4. Keywords are returned as an array of strings (typically 3-8 keywords)
5. Processing time is measured in milliseconds for performance monitoring
