export type ExecutionRequest = {
  executionRequestId: string
  locale: { code: 'EN' | 'FR' | 'NO' | 'ES' | 'AR'; direction: 'LTR' | 'RTL' }
  currency: string
  tasks: Array<{
    taskId: string
    version: string
    input: Record<string, unknown>
  }>
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED'
  createdAt: string
}
