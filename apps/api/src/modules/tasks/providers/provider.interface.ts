import { TaskType, TaskInput, TaskResult } from '../task.types';

export interface TaskProvider {
  name: string;
  execute(
    taskType: TaskType,
    input: TaskInput
  ): Promise<TaskResult>;
}
