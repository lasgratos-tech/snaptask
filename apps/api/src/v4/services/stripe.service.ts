import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-11-17.clover',
})

/**
 * Crée un PaymentIntent Stripe en mode ESCROW (capture manuelle)
 */
export async function createStripePaymentIntent(params: {
  amount: number
  currency: string
  taskExecutionId: string
  metadata?: Record<string, string>
}): Promise<Stripe.PaymentIntent> {
  const { amount, currency, taskExecutionId, metadata = {} } = params

  // En mode DEV/TEST, on peut simuler sans appeler Stripe réellement
  if (process.env.NODE_ENV === 'development' && !process.env.STRIPE_SECRET_KEY?.startsWith('sk_live')) {
    // Simulation pour DEV
    return {
      id: `pi_sim_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
      object: 'payment_intent',
      amount,
      currency,
      status: 'requires_capture',
      capture_method: 'manual',
      metadata: {
        taskExecutionId,
        ...metadata,
      },
    } as Stripe.PaymentIntent
  }

  // Production : appel Stripe réel
  return await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Stripe utilise les centimes
    currency: currency.toLowerCase(),
    capture_method: 'manual', // Mode ESCROW
    metadata: {
      taskExecutionId,
      ...metadata,
    },
  })
}

/**
 * Capture un PaymentIntent Stripe
 */
export async function captureStripePaymentIntent(
  stripePaymentIntentId: string,
): Promise<Stripe.PaymentIntent> {
  // En mode DEV/TEST, simulation
  if (process.env.NODE_ENV === 'development' && !process.env.STRIPE_SECRET_KEY?.startsWith('sk_live')) {
    return {
      id: stripePaymentIntentId,
      object: 'payment_intent',
      status: 'succeeded',
      amount_capturable: 0,
      amount_captured: 0,
    } as Stripe.PaymentIntent
  }

  // Production : appel Stripe réel
  return await stripe.paymentIntents.capture(stripePaymentIntentId)
}

/**
 * Annule un PaymentIntent Stripe
 */
export async function cancelStripePaymentIntent(
  stripePaymentIntentId: string,
): Promise<Stripe.PaymentIntent> {
  // En mode DEV/TEST, simulation
  if (process.env.NODE_ENV === 'development' && !process.env.STRIPE_SECRET_KEY?.startsWith('sk_live')) {
    return {
      id: stripePaymentIntentId,
      object: 'payment_intent',
      status: 'canceled',
    } as Stripe.PaymentIntent
  }

  // Production : appel Stripe réel
  return await stripe.paymentIntents.cancel(stripePaymentIntentId)
}

/**
 * Récupère un PaymentIntent Stripe
 */
export async function getStripePaymentIntent(
  stripePaymentIntentId: string,
): Promise<Stripe.PaymentIntent | null> {
  try {
    // En mode DEV/TEST, simulation
    if (process.env.NODE_ENV === 'development' && !process.env.STRIPE_SECRET_KEY?.startsWith('sk_live')) {
      return {
        id: stripePaymentIntentId,
        object: 'payment_intent',
        status: 'requires_capture',
        amount_capturable: 0,
        amount_captured: 0,
      } as Stripe.PaymentIntent
    }

    // Production : appel Stripe réel
    return await stripe.paymentIntents.retrieve(stripePaymentIntentId)
  } catch (error) {
    console.error('Error retrieving Stripe PaymentIntent:', error)
    return null
  }
}

/**
 * Vérifie la signature d'un webhook Stripe
 */
export function verifyStripeWebhookSignature(
  payload: string | Buffer,
  signature: string,
  webhookSecret: string,
): Stripe.Event | null {
  try {
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret)
  } catch (error) {
    console.error('Stripe webhook signature verification failed:', error)
    return null
  }
}
