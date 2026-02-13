import type { BillingPlan } from './billing.types.js'
import { stripe } from './stripe.client.js'
import { getPlanQuotas } from './planQuotas.js'
import { getCommandPrice } from './commandPricing.js'

export const billingService = {
  async listPlans(): Promise<BillingPlan[]> {
    // Pas de refonte : renvoi des plans connus (placeholder logique existante)
    return [
      { code: 'FREE', priceCents: 0, currency: 'USD' },
      { code: 'PRO', priceCents: 2000, currency: 'USD' },
    ]
  },

  async getPriceForCommand(planCode: string, command: string): Promise<number> {
    const quotas = getPlanQuotas(planCode)
    return getCommandPrice(command, quotas)
  },

  async createCheckoutSession(planCode: string) {
    // Logique Stripe minimale, inchangée fonctionnellement
    return stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [],
      success_url: 'https://example.com/success',
      cancel_url: 'https://example.com/cancel',
    })
  },
}
