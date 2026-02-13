import type { ExecutionRequest } from '../models/executionRequest'

const requests: ExecutionRequest[] = []

function createExecutionRequestId() {
  return `exec_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}

export function createExecutionRequest(data: Omit<ExecutionRequest, 'executionRequestId'>) {
  const executionRequestId = createExecutionRequestId()
  const record: ExecutionRequest = { executionRequestId, ...data }
  requests.push(record)
  return record
}

export function getExecutionRequestById(executionRequestId: string) {
  return requests.find((item) => item.executionRequestId === executionRequestId)
}

export function updateExecutionRequestStatus(
  executionRequestId: string,
  status: ExecutionRequest['status'],
) {
  const request = requests.find((item) => item.executionRequestId === executionRequestId)
  if (request) {
    request.status = status
  }
  return request
}
