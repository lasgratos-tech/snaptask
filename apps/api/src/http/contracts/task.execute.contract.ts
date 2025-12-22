import { z } from 'zod';

/**
 * INPUT — ce que le client envoie
 */
export const TaskExecuteInputSchema = z.object({
  taskType: z.enum(['image', 'cv', 'pdf']),
  input: z.object({
    prompt: z.string().min(5).max(4000),
  }),
});

/**
 * OUTPUT — ce que l’API retourne
 */
export const TaskExecuteOutputSchema = z.object({
  taskId: z.string(),
  result: z.string(),
  cost: z.number(),
});

/**
 * Types TypeScript dérivés
 */
export type TaskExecuteInputType = z.infer<
  typeof TaskExecuteInputSchema
>;

export type TaskExecuteOutputType = z.infer<
  typeof TaskExecuteOutputSchema
>;