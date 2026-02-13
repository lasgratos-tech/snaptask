export interface TaskMetadata {
  taskId: string
  proofType: 'none' | 'file' | 'human_validation'
}

const taskMetadata: TaskMetadata[] = [
  { taskId: 'cv-pro', proofType: 'none' },
  { taskId: 'lettre-motivation', proofType: 'none' },
  { taskId: 'lettre-demission', proofType: 'none' },
  { taskId: 'lettre-juridique', proofType: 'human_validation' },
  { taskId: 'airbnb-etat-lieux', proofType: 'file' },
  { taskId: 'airbnb-description', proofType: 'file' },
]

export function getTaskMetadata(taskId: string): TaskMetadata | undefined {
  return taskMetadata.find((m) => m.taskId === taskId)
}

export function requiresHumanValidation(taskId: string): boolean {
  const metadata = getTaskMetadata(taskId)
  return metadata?.proofType === 'human_validation'
}
