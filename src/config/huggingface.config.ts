/**
 * Hugging Face Configuration
 */

export const HUGGINGFACE_CONFIG = {
  // API Configuration
  API_TOKEN: process.env.HUGGINGFACE_API_TOKEN || '',
  MODEL: process.env.HUGGINGFACE_MODEL || 'facebook/bart-large-cnn',
  
  // Request Configuration
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 1000,
  REQUEST_TIMEOUT_MS: parseInt(process.env.REQUEST_TIMEOUT_MS || '5000', 10),
  
  // Model Parameters
  MAX_LENGTH: 150,
  MIN_LENGTH: 30,
  DO_SAMPLE: false,
} as const;

/**
 * Validate Hugging Face configuration
 */
export function validateHuggingFaceConfig(): void {
  if (!HUGGINGFACE_CONFIG.API_TOKEN) {
    throw new Error(
      'HUGGINGFACE_API_TOKEN is not set. Please add it to your .env file.'
    );
  }

  if (!HUGGINGFACE_CONFIG.MODEL) {
    throw new Error(
      'HUGGINGFACE_MODEL is not set. Please add it to your .env file.'
    );
  }
}
