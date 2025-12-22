import { z } from 'zod';

/**
 * Codes d'erreur métier officiels SnapTask
 */
export const ErrorCodeSchema = z.enum([
  'INVALID_INPUT',
  'API_KEY_MISSING',
  'API_KEY_INVALID',
  'INSUFFICIENT_FUNDS',
  'TASK_IN_PROGRESS',
  'TASK_PREVIOUSLY_FAILED',
  'INTERNAL_ERROR',
]);

export type ErrorCode = z.infer<typeof ErrorCodeSchema>;

/**
 * Contrat de réponse d'erreur standard
 */
export const ErrorResponseSchema = z.object({
  error: ErrorCodeSchema,
  message: z.string().optional(),
  requestId: z.string().optional(),
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
