import { Request, Response, NextFunction } from 'express';
import { logger, logRequest } from '../utils/logger.utils';

/**
 * Request/Response Logging Middleware
 * Logs detailed information about each API request
 */

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const startTime = Date.now();

  // Log incoming request
  logger.info('Incoming request', {
    method: req.method,
    path: req.path,
    query: req.query,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  // Capture original send function
  const originalSend = res.send;

  // Override send function to log response
  res.send = function (data: any): Response {
    const duration = Date.now() - startTime;

    // Log response
    logRequest(req.method, req.path, res.statusCode, duration);

    // Log additional details for non-health endpoints
    if (req.path !== '/health') {
      logger.info('Request completed', {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        success: res.statusCode < 400,
      });
    }

    // Call original send
    return originalSend.call(this, data);
  };

  next();
}

/**
 * Performance monitoring middleware
 * Warns if requests exceed performance thresholds
 */
export function performanceMonitor(threshold = 5000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - startTime;

      if (duration > threshold) {
        logger.warn('Slow request detected', {
          method: req.method,
          path: req.path,
          duration: `${duration}ms`,
          threshold: `${threshold}ms`,
          statusCode: res.statusCode,
        });
      }
    });

    next();
  };
}
