export interface TaskPricing {
  taskId: string
  amount: number
  currency: string
}

const taskPricing: TaskPricing[] = [
  { taskId: 'cv-pro', amount: 500, currency: 'EUR' },
  { taskId: 'lettre-motivation', amount: 300, currency: 'EUR' },
  { taskId: 'lettre-demission', amount: 200, currency: 'EUR' },
  { taskId: 'lettre-juridique', amount: 800, currency: 'EUR' },
  { taskId: 'airbnb-etat-lieux', amount: 1500, currency: 'EUR' },
  { taskId: 'airbnb-description', amount: 400, currency: 'EUR' },
]

export function getTaskPricing(taskId: string): TaskPricing | undefined {
  return taskPricing.find((p) => p.taskId === taskId)
}
