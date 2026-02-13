import { PaymentIntent, PaymentIntentStatus } from '../models/payment.js'

const paymentIntents: PaymentIntent[] = []

export function createPaymentIntent(
  taskExecutionId: string,
  amount: number,
  currency: string,
  stripePaymentIntentId?: string,
): PaymentIntent {
  const intent: PaymentIntent = {
    id: `pay_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
    taskExecutionId,
    amount,
    currency,
    status: 'pending',
    stripePaymentIntentId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  paymentIntents.push(intent)
  return intent
}

export function updatePaymentIntentStripeId(
  id: string,
  stripePaymentIntentId: string,
): PaymentIntent | null {
  const intent = paymentIntents.find((p) => p.id === id)
  if (!intent) {
    return null
  }

  intent.stripePaymentIntentId = stripePaymentIntentId
  intent.updatedAt = new Date().toISOString()
  return intent
}

export function setPaymentIntentOnHold(id: string, reason: string): PaymentIntent | null {
  const intent = paymentIntents.find((p) => p.id === id)
  if (!intent) {
    return null
  }

  intent.status = 'on_hold'
  intent.onHoldReason = reason
  intent.updatedAt = new Date().toISOString()
  return intent
}

export function releasePaymentIntentFromHold(id: string): PaymentIntent | null {
  const intent = paymentIntents.find((p) => p.id === id)
  if (!intent || intent.status !== 'on_hold') {
    return null
  }

  intent.status = 'authorized'
  intent.onHoldReason = undefined
  intent.updatedAt = new Date().toISOString()
  return intent
}

export function authorizePaymentIntent(id: string): PaymentIntent | null {
  const intent = paymentIntents.find((p) => p.id === id)
  if (!intent || intent.status !== 'pending') {
    return null
  }

  intent.status = 'authorized'
  intent.authorizedAt = new Date().toISOString()
  intent.updatedAt = new Date().toISOString()

  return intent
}

export function capturePaymentIntent(id: string): PaymentIntent | null {
  const intent = paymentIntents.find((p) => p.id === id)
  if (!intent || (intent.status !== 'authorized' && intent.status !== 'pending')) {
    return null
  }

  intent.status = 'captured'
  intent.capturedAt = new Date().toISOString()
  intent.updatedAt = new Date().toISOString()

  return intent
}

export function cancelPaymentIntent(id: string, reason: string): PaymentIntent | null {
  const intent = paymentIntents.find((p) => p.id === id)
  if (!intent || intent.status === 'captured') {
    return null
  }

  intent.status = 'canceled'
  intent.canceledAt = new Date().toISOString()
  intent.canceledReason = reason
  intent.updatedAt = new Date().toISOString()

  return intent
}

export function getPaymentIntentByExecutionId(taskExecutionId: string): PaymentIntent | undefined {
  return paymentIntents.find((p) => p.taskExecutionId === taskExecutionId)
}

export function getAllPaymentIntents(): PaymentIntent[] {
  return paymentIntents.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
}

export function getPaymentIntentById(id: string): PaymentIntent | undefined {
  return paymentIntents.find((p) => p.id === id)
}

export function refundPaymentIntent(id: string, reason: string): PaymentIntent | null {
  const intent = paymentIntents.find((p) => p.id === id)
  if (!intent) {
    return null
  }

  // Pour V4, on simule le remboursement en annulant le paiement
  // En production, cela déclencherait un vrai remboursement Stripe
  if (intent.status === 'captured') {
    // Simuler le remboursement
    intent.status = 'canceled'
    intent.canceledAt = new Date().toISOString()
    intent.canceledReason = `Refunded: ${reason}`
    intent.updatedAt = new Date().toISOString()
    return intent
  }

  // Si pas encore capturé, simplement annuler
  if (intent.status === 'authorized' || intent.status === 'pending') {
    return cancelPaymentIntent(id, `Refunded: ${reason}`)
  }

  return null
}
