export type PaymentIntentStatus = 'pending' | 'authorized' | 'captured' | 'canceled' | 'on_hold'

export interface PaymentIntent {
  id: string
  taskExecutionId: string
  amount: number
  currency: string
  status: PaymentIntentStatus
  stripePaymentIntentId?: string
  authorizedAt?: string
  capturedAt?: string
  canceledAt?: string
  canceledReason?: string
  onHoldReason?: string
  createdAt: string
  updatedAt: string
}
