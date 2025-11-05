import { Request, Response, NextFunction } from 'express';
import { CONFIG } from '../constants';
import { createTimeoutError } from './error.middleware';

/**
 * Request Timeout Middleware
 * Ensures requests don't exceed the maximum allowed processing time
 */
export function requestTimeout(timeoutMs: number = CONFIG.REQUEST_TIMEOUT_MS) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Set timeout on the request
    req.setTimeout(timeoutMs, () => {
      if (!res.headersSent) {
        next(createTimeoutError());
      }
    });

    // Set timeout on the response
    res.setTimeout(timeoutMs, () => {
      if (!res.headersSent) {
        next(createTimeoutError());
      }
    });

    next();
  };
}
