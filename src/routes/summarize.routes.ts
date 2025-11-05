import { Router } from 'express';
import { summarizeText } from '../controllers/summarize.controller';
import { validateRequest } from '../middleware/validation.middleware';
import { summarizeRequestSchema } from '../schemas/validation.schemas';
import { requestTimeout } from '../middleware/timeout.middleware';
import { CONFIG } from '../constants';

/**
 * Summarization API Routes
 */

const router = Router();

/**
 * POST /api/summarize
 * Generate summary with title, keywords, and sentiment from input text
 */
router.post(
  '/summarize',
  requestTimeout(CONFIG.REQUEST_TIMEOUT_MS),
  validateRequest(summarizeRequestSchema),
  summarizeText
);

export { router as summarizeRouter };
