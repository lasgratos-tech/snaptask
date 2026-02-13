import { TaskExecution, TaskExecutionStatus } from '../models/proof'

export const MOCK_EXECUTIONS: TaskExecution[] = [
  {
    id: 'exec-001',
    taskId: 'cv-pro',
    userId: 'user-123',
    status: TaskExecutionStatus.COMPLETED,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:05:00Z',
  },
  {
    id: 'exec-002',
    taskId: 'airbnb-etat-lieux',
    userId: 'user-456',
    status: TaskExecutionStatus.WAITING_PROOF,
    createdAt: '2024-01-16T14:00:00Z',
    updatedAt: '2024-01-16T14:10:00Z',
  },
  {
    id: 'exec-003',
    taskId: 'lettre-juridique',
    userId: 'user-789',
    status: TaskExecutionStatus.WAITING_VALIDATION,
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
    status: TaskExecutionStatus.PROCESSING,
    createdAt: '2024-01-18T11:00:00Z',
    updatedAt: '2024-01-18T11:01:00Z',
  },
  {
    id: 'exec-005',
    taskId: 'lettre-juridique',
    userId: 'user-456',
    status: TaskExecutionStatus.REJECTED,
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

export function getExecutionsByTaskId(taskId: string): TaskExecution[] {
  return MOCK_EXECUTIONS.filter((exec) => exec.taskId === taskId)
}

export function getExecutionById(id: string): TaskExecution | undefined {
  return MOCK_EXECUTIONS.find((exec) => exec.id === id)
}
