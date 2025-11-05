import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodSchema } from 'zod';
import { ErrorResponse } from '../types/api.types';
import { HTTP_STATUS, ERROR_CODES, ERROR_MESSAGES } from '../constants';

/**
 * Validation Middleware Factory
 * Creates middleware to validate request body against a Zod schema
 */
export function validateRequest(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Validate request body
      const validated = schema.parse(req.body);
      
      // Replace request body with validated data
      req.body = validated;
      
      // Continue to next middleware
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Handle Zod validation errors
        const issues = error.issues;
        const firstIssue = issues[0];
        
        const errorResponse: ErrorResponse = {
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: ERROR_MESSAGES.VALIDATION_ERROR,
            details: {
              field: firstIssue?.path.join('.') || 'unknown',
              issue: firstIssue?.message || 'Validation failed',
            },
          },
        };

        res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json(errorResponse);
        return;
      }

      // Handle unexpected errors
      const errorResponse: ErrorResponse = {
        success: false,
        error: {
          code: ERROR_CODES.INTERNAL_ERROR,
          message: ERROR_MESSAGES.INTERNAL_ERROR,
        },
      };

      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(errorResponse);
    }
  };
}

/**
 * Middleware to validate text input specifically
 * Checks for empty, missing, or oversized text
 */
export function validateTextInput(req: Request, res: Response, next: NextFunction): void {
  const { text } = req.body;

  // Check if text exists
  if (!text) {
    const errorResponse: ErrorResponse = {
      success: false,
      error: {
        code: ERROR_CODES.INVALID_INPUT,
        message: 'Text is required',
        details: 'Request body must contain a "text" field',
      },
    };

    res.status(HTTP_STATUS.BAD_REQUEST).json(errorResponse);
    return;
  }

  // Check if text is a string
  if (typeof text !== 'string') {
    const errorResponse: ErrorResponse = {
      success: false,
      error: {
        code: ERROR_CODES.INVALID_INPUT,
        message: 'Text must be a string',
        details: `Received type: ${typeof text}`,
      },
    };

    res.status(HTTP_STATUS.BAD_REQUEST).json(errorResponse);
    return;
  }

  // Check if text is not empty after trimming
  if (text.trim().length === 0) {
    const errorResponse: ErrorResponse = {
      success: false,
      error: {
        code: ERROR_CODES.INVALID_INPUT,
        message: 'Text cannot be empty or whitespace only',
      },
    };

    res.status(HTTP_STATUS.BAD_REQUEST).json(errorResponse);
    return;
  }

  next();
}

/**
 * Middleware to validate content type
 */
export function validateContentType(req: Request, res: Response, next: NextFunction): void {
  const contentType = req.get('Content-Type');

  if (!contentType || !contentType.includes('application/json')) {
    const errorResponse: ErrorResponse = {
      success: false,
      error: {
        code: ERROR_CODES.INVALID_INPUT,
        message: 'Content-Type must be application/json',
        details: `Received: ${contentType || 'none'}`,
      },
    };

    res.status(HTTP_STATUS.BAD_REQUEST).json(errorResponse);
    return;
  }

  next();
}
