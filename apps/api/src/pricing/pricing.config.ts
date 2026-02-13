import type { TaskPricing } from './pricing.types.js';

export const TASK_PRICING: TaskPricing[] = [
  { taskType: 'text_summarize', costCredits: 1 },
  { taskType: 'text_generate', costCredits: 2 },
  { taskType: 'image_generate', costCredits: 5 },
  { taskType: 'pdf_summarize', costCredits: 3 },
  { taskType: 'cv_generate', costCredits: 4 },
];
