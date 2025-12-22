export type TaskType =
  | 'text_summarize'
  | 'text_generate'
  | 'image_generate'
  | 'pdf_summarize'
  | 'cv_generate';

export interface TaskPricing {
  taskType: TaskType;
  costCredits: number;
}
