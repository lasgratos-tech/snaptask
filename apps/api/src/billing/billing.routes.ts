import type { FastifyInstance } from 'fastify';
import Stripe from 'stripe';
import { createCheckout, creditFromStripeEvent } from './billing.service';
import { requireApiKey } from '../auth/apiKey.guard';

export async function billingRoutes(app: FastifyInstance) {
  app.post(
    '/billing/checkout',
    { preHandler: requireApiKey },
    async (request, reply) => {
      const user = request.user!;
      const { euros } = request.body as { euros: number };

      if (!euros || euros <= 0) {
        return reply.status(400).send({ error: 'INVALID_AMOUNT' });
      }

      const url = await createCheckout(user.owner, euros);
      return reply.send({ url });
    }
  );

  app.post('/billing/webhook', async (request, reply) => {
    const sig = request.headers['stripe-signature'];
    if (!sig || typeof sig !== 'string') {
      return reply.status(400).send('Missing signature');
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2024-04-10',
    });

    const event = stripe.webhooks.constructEvent(
      request.rawBody!,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const owner = session.metadata?.owner!;
      const credits = Number(session.metadata?.credits || 0);

      creditFromStripeEvent(owner, credits);
    }

    reply.send({ received: true });
  });
}
