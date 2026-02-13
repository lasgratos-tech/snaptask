import type { ExecutionRequest } from '../models/executionRequest'
import type { Receipt } from '../models/receipt'
import type { TaskResult } from '../models/taskResult'

const resultsByExecution: Record<string, TaskResult[]> = {}
const receiptsByExecution: Record<string, Receipt[]> = {}

function createOutputRef(executionRequestId: string, taskId: string) {
  return `out_${executionRequestId}_${taskId}`
}

function createReceiptId(executionRequestId: string, taskId: string) {
  return `rcpt_${executionRequestId}_${taskId}`
}

export function executeExecutionRequest(request: ExecutionRequest) {
  const taskResults: TaskResult[] = request.tasks.map((task) => {
    const shouldFail = Boolean((task.input as Record<string, unknown>).fail)
    if (shouldFail) {
      return {
        taskId: task.taskId,
        version: task.version,
        status: 'FAILED',
      }
    }
    const outputRef = createOutputRef(request.executionRequestId, task.taskId)
    return {
      taskId: task.taskId,
      version: task.version,
      status: 'DELIVERED',
      outputRef,
    }
  })

  const receipts: Receipt[] = taskResults.map((result) => ({
    receiptId: createReceiptId(request.executionRequestId, result.taskId),
    executionRequestId: request.executionRequestId,
    taskId: result.taskId,
    version: result.version,
    status: result.status,
    issuedAt: new Date().toISOString(),
    outputRef: result.outputRef,
  }))

  resultsByExecution[request.executionRequestId] = taskResults
  receiptsByExecution[request.executionRequestId] = receipts

  return { taskResults, receipts }
}

export function getExecutionResults(executionRequestId: string) {
  return resultsByExecution[executionRequestId] ?? []
}

export function getReceiptById(receiptId: string) {
  for (const receipts of Object.values(receiptsByExecution)) {
    const match = receipts.find((item) => item.receiptId === receiptId)
    if (match) {
      return match
    }
  }
  return undefined
}
