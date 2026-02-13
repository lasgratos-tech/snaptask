import type { Money } from './money'

export type PaymentAuthorization = {
  paymentRef: string
  executionRequestId: string
  amount: Money
  status: 'AUTHORIZED' | 'FAILED'
  createdAt: string
}
