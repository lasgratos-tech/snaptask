export type TaskType = 'image' | 'cv' | 'pdf';

export type TaskInput = {
  prompt: string;
};

export type TaskResult = {
  result: string;
  provider: string;
  durationMs: number;
};
