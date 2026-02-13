import type { Locale } from './locale'

export type TaskExecution = {
  executionId: string
  taskId: string
  version: string
  locale: Locale
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED'
  createdAt: string
  completedAt?: string
  outputRef?: string
}
