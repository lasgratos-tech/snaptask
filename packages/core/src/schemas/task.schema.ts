import { z } from "zod";

export const TaskSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  status: z.enum(["todo", "doing", "done"]),
  priority: z.enum(["low", "medium", "high"]),

  /**
   * ISO date (YYYY-MM-DD)
   */
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),

  /**
   * ISO datetime (RFC 3339)
   */
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type TaskInput = z.infer<typeof TaskSchema>;
