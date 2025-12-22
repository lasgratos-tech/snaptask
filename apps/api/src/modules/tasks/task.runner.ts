import { TaskType, TaskInput, TaskResult } from './task.types';
import { getActiveProvider } from './providers';

export async function executeTask(
  taskType: TaskType,
  input: TaskInput
): Promise<TaskResult> {
  const provider = getActiveProvider();

  const start = Date.now();
  const result = await provider.execute(taskType, input);

  return {
    ...result,
    durationMs: Date.now() - start,
  };
}
