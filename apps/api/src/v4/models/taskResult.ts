export type TaskResult = {
  taskId: string
  version: string
  status: 'DELIVERED' | 'FAILED'
  outputRef?: string
  receiptRef?: string
}
