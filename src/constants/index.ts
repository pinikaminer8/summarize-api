/**
 * Application Constants
 */

// ============================================================================
// HTTP Status Codes
// ============================================================================

export const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

// ============================================================================
// Error Codes
// ============================================================================

export const ERROR_CODES = {
  INVALID_INPUT: 'INVALID_INPUT',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  REQUEST_TIMEOUT: 'REQUEST_TIMEOUT',
} as const;

// ============================================================================
// Error Messages
// ============================================================================

export const ERROR_MESSAGES = {
  INVALID_INPUT: 'Invalid input parameters',
  VALIDATION_ERROR: 'Request validation failed',
  RATE_LIMIT_EXCEEDED: 'Too many requests. Please try again later.',
  INTERNAL_ERROR: 'An unexpected error occurred while processing your request',
  SERVICE_UNAVAILABLE: 'The summarization service is temporarily unavailable. Please try again later.',
  REQUEST_TIMEOUT: 'Request processing exceeded the maximum allowed time',
} as const;

// ============================================================================
// Configuration Constants
// ============================================================================

export const CONFIG = {
  MAX_INPUT_LENGTH: 10000,
  MIN_INPUT_LENGTH: 10,
  REQUEST_TIMEOUT_MS: 5000,
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 100,
} as const;

// ============================================================================
// API Routes
// ============================================================================

export const ROUTES = {
  API_BASE: '/api',
  SUMMARIZE: '/api/summarize',
} as const;
