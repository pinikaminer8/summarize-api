import winston from 'winston';

/**
 * Logger Configuration using Winston
 */

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Custom log format
const logFormat = printf(({ level, message, timestamp, stack, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message}`;
  
  // Add stack trace for errors
  if (stack) {
    msg += `\n${stack}`;
  }
  
  // Add metadata if present
  if (Object.keys(metadata).length > 0) {
    msg += `\n${JSON.stringify(metadata, null, 2)}`;
  }
  
  return msg;
});

// Create logger instance
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [
    // Console transport
    new winston.transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat
      ),
    }),
    // File transport for errors
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // File transport for all logs
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// Create a stream for Morgan HTTP logging
export const morganStream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

/**
 * Log API request
 */
export function logRequest(method: string, path: string, statusCode: number, duration: number) {
  logger.info('API Request', {
    method,
    path,
    statusCode,
    duration: `${duration}ms`,
  });
}

/**
 * Log API error
 */
export function logError(error: Error, context?: Record<string, unknown>) {
  logger.error('API Error', {
    message: error.message,
    stack: error.stack,
    ...context,
  });
}

/**
 * Log Hugging Face API call
 */
export function logHuggingFaceCall(model: string, inputLength: number, duration: number) {
  logger.info('Hugging Face API Call', {
    model,
    inputLength,
    duration: `${duration}ms`,
  });
}
