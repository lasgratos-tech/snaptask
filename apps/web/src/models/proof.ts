export enum ProofType {
  NONE = 'none',
  FILE = 'file',
  HUMAN_VALIDATION = 'human_validation',
}

export enum TaskExecutionStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  WAITING_PROOF = 'WAITING_PROOF',
  WAITING_VALIDATION = 'WAITING_VALIDATION',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
}

export type ValidationDecision = 'approved' | 'rejected' | null

export interface TaskExecution {
  id: string
  taskId: string
  userId: string
  status: TaskExecutionStatus
  proofUrl?: string
  proofUploadedAt?: string
  deliverableUrl?: string
  validatedAt?: string
  validatedBy?: 'admin' | null
  validationDecision?: ValidationDecision
  validationComment?: string
  rejectedReason?: string
  createdAt: string
  updatedAt: string
}

export function requiresProof(proofType: ProofType): boolean {
  return proofType !== ProofType.NONE
}

export function isWaitingForProof(status: TaskExecutionStatus): boolean {
  return status === TaskExecutionStatus.WAITING_PROOF
}

export function isWaitingForValidation(status: TaskExecutionStatus): boolean {
  return status === TaskExecutionStatus.WAITING_VALIDATION
}

export function isCompleted(status: TaskExecutionStatus): boolean {
  return status === TaskExecutionStatus.COMPLETED
}

export function isRejected(status: TaskExecutionStatus): boolean {
  return status === TaskExecutionStatus.REJECTED
}
