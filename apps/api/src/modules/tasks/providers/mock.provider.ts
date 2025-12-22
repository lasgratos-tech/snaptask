import { TaskProvider } from './provider.interface';
import { TaskType, TaskInput, TaskResult } from '../task.types';

export const MockProvider: TaskProvider = {
  name: 'mock',

  async execute(
    taskType: TaskType,
    input: TaskInput
  ): Promise<TaskResult> {
    const start = Date.now();

    return {
      result: `[MOCK:${taskType}] ${input.prompt}`,
      provider: 'mock',
      durationMs: Date.now() - start,
    };
  },
};
