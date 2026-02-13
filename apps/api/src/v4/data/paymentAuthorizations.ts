import type { Money } from '../models/money'
import type { PaymentAuthorization } from '../models/paymentAuthorization'

const payments: PaymentAuthorization[] = []

function createPaymentRef() {
  return `pay_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}

export function createPaymentAuthorization(params: {
  executionRequestId: string
  amount: Money
  status: 'AUTHORIZED' | 'FAILED'
}) {
  const record: PaymentAuthorization = {
    paymentRef: createPaymentRef(),
    executionRequestId: params.executionRequestId,
    amount: params.amount,
    status: params.status,
    createdAt: new Date().toISOString(),
  }
  payments.push(record)
  return record
}
