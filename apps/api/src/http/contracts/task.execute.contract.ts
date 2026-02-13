import { z } from 'zod'

/**
 * INPUT — contrat canonique d’exécution
 * ⚠️ volontairement permissif (Zod v4 safe)
 */
export const TaskExecuteInputSchema = z.object({
  taskType: z.string().min(1),
  input: z.any(),
})

/**
 * OUTPUT — réponse standard
 */
export const TaskExecuteOutputSchema = z.object({
  taskId: z.string(),
  result: z.any(),
})

export type TaskExecuteInputType = z.infer<typeof TaskExecuteInputSchema>
export type TaskExecuteOutputType = z.infer<typeof TaskExecuteOutputSchema>
