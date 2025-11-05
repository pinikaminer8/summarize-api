import { Request, Response, NextFunction } from 'express';
import { summarizationService } from '../services/summarization.service';
import { SuccessResponse } from '../types/api.types';
import { sendSuccess, sendInternalError } from '../utils/response.utils';
import { logger } from '../utils/logger.utils';

/**
 * Summarization Controller
 * Handles HTTP requests for the /api/summarize endpoint
 */

/**
 * POST /api/summarize
 * Generate summary, title, keywords, and sentiment from input text
 */
export async function summarizeText(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const startTime = Date.now();

  try {
    const { text } = req.body;

    logger.info('Received summarization request', {
      inputLength: text.length,
      method: req.method,
      path: req.path,
    });

    // Generate summary data
    const summaryData = await summarizationService.generateSummary(text);

    // Validate output
    const isValid = summarizationService.validateOutput(summaryData);
    if (!isValid) {
      logger.error('Generated summary failed validation', { summaryData });
      sendInternalError(res, 'Generated summary does not match required schema');
      return;
    }

    // Calculate processing time
    const processingTimeMs = Date.now() - startTime;

    // Build success response
    const response: SuccessResponse = {
      success: true,
      data: summaryData,
      metadata: {
        processingTimeMs,
        inputLength: text.length,
        model: process.env.HUGGINGFACE_MODEL || 'facebook/bart-large-cnn',
      },
    };

    logger.info('Summarization request completed', {
      processingTimeMs,
      inputLength: text.length,
      outputValid: isValid,
    });

    sendSuccess(res, response);
  } catch (error) {
    logger.error('Summarization request failed', {
      error: error instanceof Error ? error.message : String(error),
      processingTimeMs: Date.now() - startTime,
    });
    next(error);
  }
}
