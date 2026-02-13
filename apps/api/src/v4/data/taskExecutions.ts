export type ValidationDecision = 'approved' | 'rejected' | null

export type TaskExecutionStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'WAITING_PROOF'
  | 'WAITING_VALIDATION'
  | 'COMPLETED'
  | 'REJECTED'

export interface TaskExecution {
  id: string
  taskId: string
  userId: string
  status: TaskExecutionStatus
  proofUrl?: string
  proofUploadedAt?: string
  validatedAt?: string
  validatedBy?: 'admin' | null
  validationDecision?: ValidationDecision
  validationComment?: string
  rejectedReason?: string
  deliverableUrl?: string
  createdAt: string
  updatedAt: string
}

const executions: TaskExecution[] = [
  {
    id: 'exec-001',
    taskId: 'cv-pro',
    userId: 'user-123',
    status: 'COMPLETED',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:05:00Z',
  },
  {
    id: 'exec-002',
    taskId: 'airbnb-etat-lieux',
    userId: 'user-456',
    status: 'WAITING_PROOF',
    createdAt: '2024-01-16T14:00:00Z',
    updatedAt: '2024-01-16T14:10:00Z',
  },
  {
    id: 'exec-003',
    taskId: 'lettre-juridique',
    userId: 'user-789',
    status: 'WAITING_VALIDATION',
    proofUrl: 'https://example.com/proof/exec-003.pdf',
    proofUploadedAt: '2024-01-17T09:00:00Z',
    deliverableUrl: 'https://example.com/deliverable/exec-003.pdf',
    createdAt: '2024-01-17T08:00:00Z',
    updatedAt: '2024-01-17T09:00:00Z',
  },
  {
    id: 'exec-004',
    taskId: 'airbnb-description',
    userId: 'user-123',
    status: 'PROCESSING',
    createdAt: '2024-01-18T11:00:00Z',
    updatedAt: '2024-01-18T11:01:00Z',
  },
  {
    id: 'exec-005',
    taskId: 'lettre-juridique',
    userId: 'user-456',
    status: 'REJECTED',
    proofUrl: 'https://example.com/proof/exec-005.pdf',
    proofUploadedAt: '2024-01-19T10:00:00Z',
    validatedAt: '2024-01-19T10:30:00Z',
    validatedBy: 'admin',
    validationDecision: 'rejected',
    validationComment: 'Preuve insuffisante',
    rejectedReason: 'Preuve insuffisante',
    createdAt: '2024-01-19T09:00:00Z',
    updatedAt: '2024-01-19T10:30:00Z',
  },
]

export function getExecutionsWaitingValidation(): TaskExecution[] {
  return executions.filter((exec) => exec.status === 'WAITING_VALIDATION')
}

export function getExecutionById(id: string): TaskExecution | undefined {
  return executions.find((exec) => exec.id === id)
}

export function getAllExecutions(): TaskExecution[] {
  return [...executions]
}

export function createTaskExecution(params: {
  taskId: string
  userId: string
  status: TaskExecutionStatus
}): TaskExecution {
  const execution: TaskExecution = {
    id: `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    taskId: params.taskId,
    userId: params.userId,
    status: params.status,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  executions.push(execution)
  return execution
}

export function updateExecutionStatus(
  id: string,
  newStatus: TaskExecutionStatus,
): TaskExecution | null {
  const exec = executions.find((e) => e.id === id)
  if (!exec) {
    return null
  }

  exec.status = newStatus
  exec.updatedAt = new Date().toISOString()
  return exec
}

export function updateExecutionProof(
  id: string,
  proofUrl: string,
): TaskExecution | null {
  const exec = executions.find((e) => e.id === id)
  if (!exec) {
    return null
  }

  exec.proofUrl = proofUrl
  exec.proofUploadedAt = new Date().toISOString()
  exec.updatedAt = new Date().toISOString()
  return exec
}

export function updateExecutionValidation(
  id: string,
  decision: ValidationDecision,
  validatedBy: 'admin' | null,
  comment?: string,
  rejectedReason?: string,
): TaskExecution | null {
  const exec = executions.find((e) => e.id === id)
  if (!exec) {
    return null
  }

  exec.validationDecision = decision
  exec.validatedBy = validatedBy
  exec.validatedAt = new Date().toISOString()
  exec.validationComment = comment
  if (rejectedReason) {
    exec.rejectedReason = rejectedReason
  }
  exec.updatedAt = new Date().toISOString()
  return exec
}

export function updateExecutionDeliverable(
  id: string,
  deliverableUrl: string,
): TaskExecution | null {
  const exec = executions.find((e) => e.id === id)
  if (!exec) {
    return null
  }

  exec.deliverableUrl = deliverableUrl
  exec.updatedAt = new Date().toISOString()
  return exec
}

export async function validateExecution(
  id: string,
  comment?: string,
  actorId?: string,
  actorType: 'admin' | 'reviewer' = 'admin',
): Promise<TaskExecution | null> {
  const exec = executions.find((e) => e.id === id)
  if (!exec || exec.status !== 'WAITING_VALIDATION') {
    return null
  }

  // Audit de la validation avant la transition
  try {
    const { createAuditLog } = await import('./auditLog.js')
    await createAuditLog(
      'VALIDATION_APPROVED',
      'taskExecution',
      id,
      actorType,
      actorId,
      {
        validationComment: comment,
        validatedAt: new Date().toISOString(),
      },
    )
  } catch (err) {
    console.error('Audit log failed:', err)
  }

  // Mettre à jour la validation
  updateExecutionValidation(id, 'approved', 'admin', comment)

  // Utiliser le Task Engine pour gérer la transition
  const { runTaskExecution } = await import('../engine/taskEngine.js')
  return await runTaskExecution(id)
}

export async function rejectExecution(
  id: string,
  reason: string,
  comment?: string,
  actorId?: string,
  actorType: 'admin' | 'reviewer' = 'admin',
): Promise<TaskExecution | null> {
  const exec = executions.find((e) => e.id === id)
  if (!exec || exec.status !== 'WAITING_VALIDATION') {
    return null
  }

  // Audit du rejet avant la transition
  try {
    const { createAuditLog } = await import('./auditLog.js')
    await createAuditLog(
      'VALIDATION_REJECTED',
      'taskExecution',
      id,
      actorType,
      actorId,
      {
        rejectedReason: reason,
        validationComment: comment,
        validatedAt: new Date().toISOString(),
      },
    )
  } catch (err) {
    console.error('Audit log failed:', err)
  }

  // Mettre à jour la validation
  updateExecutionValidation(id, 'rejected', 'admin', comment, reason)

  // Utiliser le Task Engine pour gérer la transition
  const { runTaskExecution } = await import('../engine/taskEngine.js')
  return await runTaskExecution(id)
}

export async function uploadProof(
  id: string,
  proofUrl: string,
  requiresHumanValidation: boolean,
): Promise<TaskExecution | null> {
  const exec = executions.find((e) => e.id === id)
  if (!exec || exec.status !== 'WAITING_PROOF') {
    return null
  }

  if (exec.proofUrl) {
    throw new Error('PROOF_ALREADY_UPLOADED')
  }

  // Mettre à jour la preuve
  updateExecutionProof(id, proofUrl)

  // Audit de l'upload
  try {
    const { createAuditLog } = await import('./auditLog.js')
    await createAuditLog(
      'PROOF_UPLOADED',
      'taskExecution',
      id,
      'user',
      exec.userId,
      {
        proofUrl,
        requiresHumanValidation,
      },
    )
  } catch (err) {
    console.error('Audit log failed:', err)
  }

  // Utiliser le Task Engine pour gérer la transition
  const { runTaskExecution } = await import('../engine/taskEngine.js')
  return await runTaskExecution(id)
}
