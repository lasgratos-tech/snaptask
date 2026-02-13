import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // Version compatible avec le SDK installé
  apiVersion: '2025-11-17.clover',
})
