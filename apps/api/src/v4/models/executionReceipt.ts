export type ExecutionReceipt = {
  receiptId: string
  executionId: string
  taskId: string
  version: string
  status: 'DELIVERED' | 'FAILED'
  issuedAt: string
  outputRef?: string
}
