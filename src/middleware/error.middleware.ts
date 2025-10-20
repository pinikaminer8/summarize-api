import { Request, Response, NextFunction } from 'express';
import { ErrorResponse } from '../types/api.types';
import { HTTP_STATUS, ERROR_CODES, ERROR_MESSAGES } from '../constants';
import { trackError } from '../utils/error-tracker.utils';
import { logError } from '../utils/logger.utils';

/**
 * Custom Application Error Class
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: string | Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Centralized Error Handling Middleware
 * Must be placed after all routes
 */
export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Log error for debugging
  logError(err, {
    path: req.path,
    method: req.method,
    body: req.body,
  });

  // Handle known application errors
  if (err instanceof AppError) {
    // Track the error
    trackError(err.code, err.message, {
      statusCode: err.statusCode,
      path: req.path,
    });

    const errorResponse: ErrorResponse = {
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(process.env.NODE_ENV === 'development' && err.details ? { details: err.details } : {}),
      },
    };

    res.status(err.statusCode).json(errorResponse);
    return;
  }

  // Handle unexpected errors
  trackError(ERROR_CODES.INTERNAL_ERROR, err.message, {
    path: req.path,
    stack: err.stack,
  });

  const errorResponse: ErrorResponse = {
    success: false,
    error: {
      code: ERROR_CODES.INTERNAL_ERROR,
      message: ERROR_MESSAGES.INTERNAL_ERROR,
      ...(process.env.NODE_ENV === 'development' && err.message ? { details: err.message } : {}),
    },
  };

  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(errorResponse);
}

/**
 * 404 Not Found Handler
 */
export function notFoundHandler(req: Request, res: Response): void {
  const errorResponse: ErrorResponse = {
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Cannot ${req.method} ${req.path}`,
      details: 'The requested endpoint does not exist',
    },
  };

  res.status(404).json(errorResponse);
}

/**
 * Helper function to create validation error
 */
export function createValidationError(message: string, details?: string | Record<string, unknown>): AppError {
  return new AppError(
    HTTP_STATUS.UNPROCESSABLE_ENTITY,
    ERROR_CODES.VALIDATION_ERROR,
    message,
    details
  );
}

/**
 * Helper function to create bad request error
 */
export function createBadRequestError(message: string, details?: string | Record<string, unknown>): AppError {
  return new AppError(
    HTTP_STATUS.BAD_REQUEST,
    ERROR_CODES.INVALID_INPUT,
    message,
    details
  );
}

/**
 * Helper function to create timeout error
 */
export function createTimeoutError(): AppError {
  return new AppError(
    HTTP_STATUS.GATEWAY_TIMEOUT,
    ERROR_CODES.REQUEST_TIMEOUT,
    ERROR_MESSAGES.REQUEST_TIMEOUT
  );
}

/**
 * Helper function to create service unavailable error
 */
export function createServiceUnavailableError(): AppError {
  return new AppError(
    HTTP_STATUS.SERVICE_UNAVAILABLE,
    ERROR_CODES.SERVICE_UNAVAILABLE,
    ERROR_MESSAGES.SERVICE_UNAVAILABLE
  );
}
