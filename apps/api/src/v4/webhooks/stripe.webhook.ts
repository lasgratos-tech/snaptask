import type { FastifyInstance } from 'fastify'
import type Stripe from 'stripe'
import { verifyStripeWebhookSignature } from '../services/stripe.service.js'
import { createAuditLog, hasStripeEventBeenProcessed } from '../data/auditLog.js'
import { getPaymentIntentByExecutionId, updatePaymentIntentStripeId } from '../data/paymentIntents.js'

/**
 * Route webhook Stripe
 * ⚠️ DOIT être montée SANS middleware d'authentification API key
 * Stripe envoie les webhooks avec une signature, pas une API key
 */
export async function registerStripeWebhook(app: FastifyInstance) {
  app.post('/v4/webhooks/stripe', async (request, reply) => {
    const signature = request.headers['stripe-signature'] as string
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

    // Vérification signature obligatoire
    if (!signature) {
      return reply.code(400).send({ error: 'MISSING_SIGNATURE' })
    }

    if (!webhookSecret) {
      return reply.code(500).send({ error: 'WEBHOOK_SECRET_NOT_CONFIGURED' })
    }

    const rawBody = (request as any).rawBody || Buffer.from(JSON.stringify(request.body))
    const event = verifyStripeWebhookSignature(rawBody, signature, webhookSecret)

    if (!event) {
      return reply.code(400).send({ error: 'INVALID_SIGNATURE' })
    }

    // Vérification idempotence
    const stripeEventId = event.id
    if (hasStripeEventBeenProcessed(stripeEventId)) {
      await createAuditLog(
        'STRIPE_EVENT_DUPLICATE',
        'taskExecution',
        'system',
        'system',
        undefined,
        {
          stripeEventId,
          eventType: event.type,
        },
      )
      return reply.send({ received: true, duplicate: true })
    }

    // Logger l'événement reçu
    const eventObject = event.data.object as Stripe.PaymentIntent | Stripe.Charge | Stripe.Customer | Record<string, unknown>
    const isPaymentIntent = 'object' in eventObject && eventObject.object === 'payment_intent'
    const paymentIntent = isPaymentIntent ? (eventObject as Stripe.PaymentIntent) : null
    const taskExecutionId = paymentIntent?.metadata?.taskExecutionId || 'system'

    await createAuditLog(
      'STRIPE_EVENT_RECEIVED',
      'taskExecution',
      taskExecutionId,
      'system',
      undefined,
      {
        stripeEventId,
        eventType: event.type,
        paymentIntentId: paymentIntent?.id,
        status: paymentIntent?.status,
      },
    )

    // Traiter les événements Stripe
    try {
      switch (event.type) {
        case 'payment_intent.amount_capturable_updated': {
          if (paymentIntent && taskExecutionId && taskExecutionId !== 'system') {
            const snapPaymentIntent = getPaymentIntentByExecutionId(taskExecutionId)
            if (snapPaymentIntent && !snapPaymentIntent.stripePaymentIntentId) {
              updatePaymentIntentStripeId(snapPaymentIntent.id, paymentIntent.id)
            }

            await createAuditLog(
              'STRIPE_PAYMENT_INTENT_CREATED',
              'taskExecution',
              taskExecutionId,
              'system',
              undefined,
              {
                stripePaymentIntentId: paymentIntent.id,
                amount: paymentIntent.amount / 100,
                currency: paymentIntent.currency,
                status: paymentIntent.status,
              },
            )
          }
          break
        }

        case 'payment_intent.succeeded': {
          if (paymentIntent && taskExecutionId && taskExecutionId !== 'system') {
            await createAuditLog(
              'STRIPE_PAYMENT_INTENT_CAPTURED',
              'taskExecution',
              taskExecutionId,
              'system',
              undefined,
              {
                stripePaymentIntentId: paymentIntent.id,
                amount: paymentIntent.amount / 100,
                currency: paymentIntent.currency,
                status: paymentIntent.status,
              },
            )
          }
          break
        }

        case 'payment_intent.canceled': {
          if (paymentIntent && taskExecutionId && taskExecutionId !== 'system') {
            await createAuditLog(
              'STRIPE_PAYMENT_INTENT_CANCELED',
              'taskExecution',
              taskExecutionId,
              'system',
              undefined,
              {
                stripePaymentIntentId: paymentIntent.id,
                amount: paymentIntent.amount / 100,
                currency: paymentIntent.currency,
                status: paymentIntent.status,
              },
            )
          }
          break
        }

        default:
          // Autres événements non gérés
          break
      }

      return reply.send({ received: true })
    } catch (err) {
      console.error('Webhook processing failed:', err)
      return reply.code(500).send({ error: 'WEBHOOK_PROCESSING_FAILED' })
    }
  })
}
