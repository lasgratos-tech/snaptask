export type LedgerDirection = 'DEBIT' | 'CREDIT'
export type LedgerStatus = 'PENDING' | 'COMMITTED' | 'FAILED'

export interface LedgerCreateInput {
  userId: string
  taskCode: string
  direction: LedgerDirection
  amountCents: number
  currency: string
  idempotencyKey: string
  metadata?: Record<string, unknown>
}
