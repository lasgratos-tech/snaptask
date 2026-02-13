export type Receipt = {
  receiptId: string
  executionRequestId: string
  taskId: string
  version: string
  status: 'DELIVERED' | 'FAILED'
  issuedAt: string
  outputRef?: string
}
