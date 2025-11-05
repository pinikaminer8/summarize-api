/**
 * Error Tracking and Monitoring Utilities
 */

import { logger } from './logger.utils';
import { ErrorCode } from '../types/api.types';

/**
 * Error statistics tracking
 */
interface ErrorStats {
  code: string;
  count: number;
  lastOccurred: Date;
  examples: string[];
}

class ErrorTracker {
  private errors: Map<string, ErrorStats> = new Map();
  private readonly maxExamples = 5;

  /**
   * Track an error occurrence
   */
  track(code: string, message: string): void {
    const existing = this.errors.get(code);

    if (existing) {
      existing.count++;
      existing.lastOccurred = new Date();
      if (existing.examples.length < this.maxExamples) {
        existing.examples.push(message);
      }
    } else {
      this.errors.set(code, {
        code,
        count: 1,
        lastOccurred: new Date(),
        examples: [message],
      });
    }
  }

  /**
   * Get error statistics
   */
  getStats(): ErrorStats[] {
    return Array.from(this.errors.values()).sort((a, b) => b.count - a.count);
  }

  /**
   * Get total error count
   */
  getTotalErrors(): number {
    let total = 0;
    this.errors.forEach((stats) => (total += stats.count));
    return total;
  }

  /**
   * Reset statistics
   */
  reset(): void {
    this.errors.clear();
  }

  /**
   * Log error statistics
   */
  logStats(): void {
    const stats = this.getStats();
    const total = this.getTotalErrors();

    logger.info('Error Statistics', {
      totalErrors: total,
      uniqueErrorTypes: stats.length,
      breakdown: stats.map((s) => ({
        code: s.code,
        count: s.count,
        lastOccurred: s.lastOccurred,
      })),
    });
  }
}

// Export singleton instance
export const errorTracker = new ErrorTracker();

/**
 * Track and log an error
 */
export function trackError(code: string, message: string, context?: Record<string, unknown>): void {
  errorTracker.track(code, message);
  logger.error('Error tracked', {
    code,
    message,
    ...context,
  });
}
