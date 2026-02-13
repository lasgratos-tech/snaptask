import { TASK_PRICING } from './pricing.config.js';
import type { TaskType } from './pricing.types.js';

export function getTaskCost(taskType: TaskType): number {
  const pricing = TASK_PRICING.find(
    (p) => p.taskType === taskType
  );

  if (!pricing) {
    throw new Error(`NO_PRICING_DEFINED:${taskType}`);
  }

  return pricing.costCredits;
}
