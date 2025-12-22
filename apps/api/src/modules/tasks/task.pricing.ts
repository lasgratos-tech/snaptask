export const TASK_PRICING = {
  image: 1,
  cv: 1,
  pdf: 1,
} as const;

export type TaskType = keyof typeof TASK_PRICING;

/**
 * Récupère le prix officiel d'une tâche SnapTask
 * Source de vérité unique
 */
export function getTaskPrice(taskType: TaskType): number {
  const price = TASK_PRICING[taskType];

  if (price === undefined) {
    throw new Error('TASK_NOT_PRICED');
  }

  if (price <= 0) {
    throw new Error('INVALID_TASK_PRICE');
  }

  return price;
}
