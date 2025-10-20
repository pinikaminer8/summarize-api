import { HfInference } from '@huggingface/inference';
import { HUGGINGFACE_CONFIG } from '../config/huggingface.config';
import { createServiceUnavailableError, createTimeoutError } from '../middleware/error.middleware';
import { retryWithBackoff, isRetryableError } from '../utils/retry.utils';
import { logger, logHuggingFaceCall } from '../utils/logger.utils';

/**
 * Hugging Face Client Service
 * Handles interaction with Hugging Face Inference API
 */

class HuggingFaceService {
  private client: HfInference;
  private model: string;

  constructor() {
    this.client = new HfInference(HUGGINGFACE_CONFIG.API_TOKEN);
    this.model = HUGGINGFACE_CONFIG.MODEL;
    logger.info('Hugging Face service initialized', { model: this.model });
  }

  /**
   * Generate text summary using Hugging Face model with retry logic
   * @param text - Input text to summarize
   * @returns Summarized text
   */
  async summarizeText(text: string): Promise<string> {
    const startTime = Date.now();

    try {
      const summary = await retryWithBackoff(
        () => this.performSummarization(text),
        {
          maxRetries: HUGGINGFACE_CONFIG.MAX_RETRIES,
          delayMs: HUGGINGFACE_CONFIG.RETRY_DELAY_MS,
          backoff: true,
        }
      );

      const duration = Date.now() - startTime;
      logHuggingFaceCall(this.model, text.length, duration);

      return summary;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('Hugging Face summarization failed', {
        model: this.model,
        inputLength: text.length,
        duration: `${duration}ms`,
        error: error instanceof Error ? error.message : String(error),
      });

      this.handleError(error);
      throw error; // TypeScript needs this, but handleError always throws
    }
  }

  /**
   * Perform the actual summarization call
   */
  private async performSummarization(text: string): Promise<string> {
    const result = await this.withTimeout(
      this.client.summarization({
        model: this.model,
        inputs: text,
        parameters: {
          max_length: HUGGINGFACE_CONFIG.MAX_LENGTH,
          min_length: HUGGINGFACE_CONFIG.MIN_LENGTH,
          do_sample: HUGGINGFACE_CONFIG.DO_SAMPLE,
        },
      }),
      HUGGINGFACE_CONFIG.REQUEST_TIMEOUT_MS
    );

    if (!result || !result.summary_text) {
      throw new Error('Invalid response from Hugging Face API');
    }

    return result.summary_text;
  }

  /**
   * Wrap a promise with timeout
   */
  private async withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(createTimeoutError());
      }, timeoutMs);
    });

    return Promise.race([promise, timeoutPromise]);
  }

  /**
   * Handle Hugging Face API errors
   */
  private handleError(error: unknown): never {
    console.error('Hugging Face API Error:', error);

    if (error instanceof Error) {
      // Check for timeout errors
      if (error.message.includes('timeout') || error.message.includes('REQUEST_TIMEOUT')) {
        throw createTimeoutError();
      }

      // Check for rate limiting
      if (error.message.includes('rate limit') || error.message.includes('429')) {
        throw createServiceUnavailableError();
      }

      // Check for authentication errors
      if (error.message.includes('401') || error.message.includes('unauthorized')) {
        throw new Error('Hugging Face API authentication failed. Check your API token.');
      }

      // Check for model not found
      if (error.message.includes('404') || error.message.includes('not found')) {
        throw new Error(`Model ${this.model} not found on Hugging Face`);
      }
    }

    // Generic service unavailable error
    throw createServiceUnavailableError();
  }

  /**
   * Test the connection to Hugging Face API
   */
  async testConnection(): Promise<boolean> {
    try {
      const testText = 'This is a test sentence to verify the Hugging Face API connection.';
      await this.summarizeText(testText);
      return true;
    } catch (error) {
      console.error('Hugging Face connection test failed:', error);
      return false;
    }
  }

  /**
   * Get the current model name
   */
  getModel(): string {
    return this.model;
  }
}

// Export singleton instance
export const huggingFaceService = new HuggingFaceService();
