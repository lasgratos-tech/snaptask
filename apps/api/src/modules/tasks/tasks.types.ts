export type TaskType =
  | 'text_summarize'
  | 'text_generate'
  | 'image_generate';

export interface ExecuteTaskDTO {
  taskType: TaskType;
  input: string;
}

export interface TaskExecutionResult {
  taskType: TaskType;
  output: string;
  tokensUsed?: number;
  provider: 'openai';
}
