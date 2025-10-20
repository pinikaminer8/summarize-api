/**
 * Retry Utility for handling transient failures
 */

export interface RetryOptions {
  maxRetries: number;
  delayMs: number;
  backoff?: boolean;
}

/**
 * Retry a function with exponential backoff
 * @param fn - Async function to retry
 * @param options - Retry options
 * @returns Result from the function
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions
): Promise<T> {
  const { maxRetries, delayMs, backoff = true } = options;
  let lastError: Error | unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry on the last attempt
      if (attempt === maxRetries) {
        break;
      }

      // Calculate delay with exponential backoff
      const delay = backoff ? delayMs * Math.pow(2, attempt) : delayMs;

      console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`);

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // All retries failed
  throw lastError;
}

/**
 * Check if an error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    // Retryable errors
    if (
      message.includes('timeout') ||
      message.includes('network') ||
      message.includes('econnreset') ||
      message.includes('503') ||
      message.includes('502')
    ) {
      return true;
    }

    // Non-retryable errors
    if (
      message.includes('401') ||
      message.includes('403') ||
      message.includes('404') ||
      message.includes('400')
    ) {
      return false;
    }
  }

  // Default to retryable for unknown errors
  return true;
}
