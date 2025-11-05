/**
 * API Request and Response Type Definitions
 */

// ============================================================================
// Request Types
// ============================================================================

/**
 * Request body for POST /api/summarize endpoint
 */
export interface SummarizeRequest {
  text: string;
}

// ============================================================================
// Response Data Types
// ============================================================================

/**
 * Sentiment analysis result
 */
export type Sentiment = 'positive' | 'negative' | 'neutral';

/**
 * Summarization result data
 */
export interface SummaryData {
  title: string;
  summary: string;
  keywords: string[];
  sentiment: Sentiment;
}

/**
 * Response metadata
 */
export interface ResponseMetadata {
  processingTimeMs: number;
  inputLength: number;
  model: string;
}

/**
 * Successful API response
 */
export interface SuccessResponse {
  success: true;
  data: SummaryData;
  metadata: ResponseMetadata;
}

// ============================================================================
// Error Types
// ============================================================================

/**
 * Error codes for different failure scenarios
 */
export enum ErrorCode {
  INVALID_INPUT = 'INVALID_INPUT',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  REQUEST_TIMEOUT = 'REQUEST_TIMEOUT',
}

/**
 * Error detail structure
 */
export interface ErrorDetail {
  field?: string;
  issue?: string;
  [key: string]: unknown;
}

/**
 * Error information
 */
export interface ErrorInfo {
  code: ErrorCode | string;
  message: string;
  details?: string | ErrorDetail;
  retryAfter?: number;
}

/**
 * Error API response
 */
export interface ErrorResponse {
  success: false;
  error: ErrorInfo;
}

// ============================================================================
// Combined Response Type
// ============================================================================

/**
 * Union type for all possible API responses
 */
export type ApiResponse = SuccessResponse | ErrorResponse;

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard to check if response is successful
 */
export function isSuccessResponse(response: ApiResponse): response is SuccessResponse {
  return response.success === true;
}

/**
 * Type guard to check if response is an error
 */
export function isErrorResponse(response: ApiResponse): response is ErrorResponse {
  return response.success === false;
}

/**
 * Type guard to check if sentiment is valid
 */
export function isValidSentiment(value: string): value is Sentiment {
  return ['positive', 'negative', 'neutral'].includes(value);
}
