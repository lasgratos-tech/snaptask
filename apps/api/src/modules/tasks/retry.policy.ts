export interface RetryContext {
  attempt: number
  maxRetries: number
}

export function shouldRetry(error: unknown, context: RetryContext): boolean {
  if (context.attempt >= context.maxRetries) {
    return false
  }

  // ❌ erreurs métier → jamais retry
  if (error instanceof Error) {
    if (error.message.startsWith('INVALID_')) return false
    if (error.message.startsWith('TASK_')) return false
    if (error.message.startsWith('LEDGER_')) return false
  }

  return true
}

export function backoffDelayMs(attempt: number): number {
  switch (attempt) {
    case 0:
      return 0
    case 1:
      return 1000
    case 2:
      return 3000
    default:
      return 5000
  }
}
