import { Response } from 'express';
import { ErrorResponse, SuccessResponse } from '../types/api.types';
import { HTTP_STATUS, ERROR_CODES } from '../constants';

/**
 * Utility Functions for Sending Responses
 */

/**
 * Send a success response
 */
export function sendSuccess(res: Response, data: SuccessResponse): void {
  res.status(HTTP_STATUS.OK).json(data);
}

/**
 * Send an error response
 */
export function sendError(
  res: Response,
  statusCode: number,
  code: string,
  message: string,
  details?: string | Record<string, unknown>
): void {
  const errorResponse: ErrorResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
  };

  res.status(statusCode).json(errorResponse);
}

/**
 * Send a validation error response
 */
export function sendValidationError(
  res: Response,
  message: string,
  details?: string | Record<string, unknown>
): void {
  sendError(res, HTTP_STATUS.UNPROCESSABLE_ENTITY, ERROR_CODES.VALIDATION_ERROR, message, details);
}

/**
 * Send a bad request error response
 */
export function sendBadRequest(
  res: Response,
  message: string,
  details?: string | Record<string, unknown>
): void {
  sendError(res, HTTP_STATUS.BAD_REQUEST, ERROR_CODES.INVALID_INPUT, message, details);
}

/**
 * Send an internal server error response
 */
export function sendInternalError(res: Response, message?: string): void {
  sendError(
    res,
    HTTP_STATUS.INTERNAL_SERVER_ERROR,
    ERROR_CODES.INTERNAL_ERROR,
    message || 'An unexpected error occurred'
  );
}

/**
 * Send a rate limit error response
 */
export function sendRateLimitError(res: Response, retryAfter?: number): void {
  const errorResponse: ErrorResponse = {
    success: false,
    error: {
      code: ERROR_CODES.RATE_LIMIT_EXCEEDED,
      message: 'Too many requests. Please try again later.',
      ...(retryAfter ? { retryAfter } : {}),
    },
  };

  res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json(errorResponse);
}
