import { getStripe } from './stripe.client';
import { creditAccount } from '../ledger/ledger.store';

const CREDITS_PER_EURO = 10;

export async function createCheckout(owner: string, euros: number) {
  const stripe = getStripe();

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'eur',
          unit_amount: euros * 100,
          product_data: {
            name: 'SnapTask credits',
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      owner,
      credits: String(euros * CREDITS_PER_EURO),
    },
    success_url: 'https://example.com/success',
    cancel_url: 'https://example.com/cancel',
  });

  return session.url;
}

/**
 * 🔔 Stripe webhook → créditation ledger
 * Passe obligatoirement par le ledger pour audit
 */
export function creditFromStripeEvent(owner: string, credits: number) {
  creditAccount(owner, credits, 'stripe:checkout');
}
