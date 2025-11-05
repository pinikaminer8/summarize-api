import { z } from 'zod';

/**
 * Validation Schemas using Zod
 */

// ============================================================================
// Constants
// ============================================================================

export const MAX_INPUT_LENGTH = 10000;
export const MIN_INPUT_LENGTH = 10;

// ============================================================================
// Request Validation Schema
// ============================================================================

/**
 * Schema for validating POST /api/summarize request body
 */
export const summarizeRequestSchema = z.object({
  text: z
    .string({
      message: 'Text must be a string',
    })
    .min(MIN_INPUT_LENGTH, {
      message: `Text must be at least ${MIN_INPUT_LENGTH} characters long`,
    })
    .max(MAX_INPUT_LENGTH, {
      message: `Text must not exceed ${MAX_INPUT_LENGTH} characters`,
    })
    .trim()
    .refine((text) => text.length > 0, {
      message: 'Text cannot be empty or whitespace only',
    }),
});

/**
 * Inferred TypeScript type from Zod schema
 */
export type SummarizeRequestInput = z.infer<typeof summarizeRequestSchema>;

// ============================================================================
// Response Validation Schemas
// ============================================================================

/**
 * Sentiment enum schema
 */
export const sentimentSchema = z.enum(['positive', 'negative', 'neutral']);

/**
 * Summary data schema
 */
export const summaryDataSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  summary: z.string().min(1, 'Summary is required'),
  keywords: z.array(z.string()).min(1, 'At least one keyword is required'),
  sentiment: sentimentSchema,
});

/**
 * Response metadata schema
 */
export const responseMetadataSchema = z.object({
  processingTimeMs: z.number().positive(),
  inputLength: z.number().nonnegative(),
  model: z.string().min(1),
});

/**
 * Success response schema
 */
export const successResponseSchema = z.object({
  success: z.literal(true),
  data: summaryDataSchema,
  metadata: responseMetadataSchema,
});

/**
 * Error response schema
 */
export const errorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.union([z.string(), z.record(z.string(), z.unknown())]).optional(),
    retryAfter: z.number().optional(),
  }),
});

/**
 * Combined API response schema
 */
export const apiResponseSchema = z.union([successResponseSchema, errorResponseSchema]);

// ============================================================================
// Validation Helper Functions
// ============================================================================

/**
 * Validates summarize request input
 * @throws ZodError if validation fails
 */
export function validateSummarizeRequest(data: unknown) {
  return summarizeRequestSchema.parse(data);
}

/**
 * Safe validation that returns result object
 */
export function safeSummarizeRequest(data: unknown) {
  return summarizeRequestSchema.safeParse(data);
}
