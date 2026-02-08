import { z } from 'zod';

export const TaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.enum(['todo', 'done'])
});

export const TaskListSchema = z.array(TaskSchema);
