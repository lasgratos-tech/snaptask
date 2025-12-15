import type { FastifyInstance } from 'fastify';
import type { ActorContext } from '../auth/actorContext.js';

import { idempotencyStore } from '../infra/idempotencyStore.js';

import {
  COMMAND_PRICING,
  DEFAULT_PRICE
} from '../billing/commandPricing.js';

import { assertQuota } from '../billing/quotaGuard.js';
import { billingStore } from '../billing/billingStore.js';

import { auditStore } from '../observability/auditStore.js';
import {
  recordAccepted,
  recordRejected,
  recordDuplicate
} from '../observability/metrics.js';

type CommandRequestBody = {
  commandId: string;
  payload?: unknown;
};

export async function registerCommandRoutes(app: FastifyInstance) {
  app.post<{
    Params: { commandName: string };
    Body: CommandRequestBody;
  }>('/v1/commands/:commandName', async (request, reply) => {
    const { commandName } = request.params;
    const { commandId, payload } = request.body;

    if (!commandId) {
      return reply.status(400).send({ error: 'commandId is required' });
    }

    // 🔗 Correlation ID (observabilité)
    request.log = request.log.child({ commandId });

    // 1️⃣ Idempotence
    const existing = idempotencyStore.get(commandId);
    if (existing) {
      recordDuplicate();
      auditStore.add({
        commandId,
        actorId: 'anonymous',
        commandName,
        status: 'duplicate',
        createdAt: Date.now()
      });

      return reply.send({
        status: 'duplicate',
        command: commandName,
        result: existing.response
      });
    }

    // 2️⃣ ActorContext (temporaire)
    const actor: ActorContext = {
      actorId: 'anonymous',
      provider: 'google',
      role: 'user',
      plan: 'free'
    };

    // 3️⃣ Pricing
    const price = COMMAND_PRICING[commandName] ?? DEFAULT_PRICE;

    // 4️⃣ Quota check AVANT exécution
    try {
      assertQuota({
        actorId: actor.actorId,
        plan: actor.plan,
        cost: price.amount
      });
    } catch {
      recordRejected();
      auditStore.add({
        commandId,
        actorId: actor.actorId,
        commandName,
        status: 'rejected',
        reason: 'QUOTA_EXCEEDED',
        createdAt: Date.now()
      });

      return reply.status(402).send({
        error: 'QUOTA_EXCEEDED',
        currency: price.currency,
        amount: price.amount
      });
    }

    // 5️⃣ Simulated execution (Core plus tard)
    const result = {
      executed: true,
      command: commandName,
      payload,
      actor
    };

    // 6️⃣ Billing append-only
    billingStore.add({
      commandId,
      actorId: actor.actorId,
      amount: price.amount,
      currency: price.currency,
      createdAt: Date.now()
    });

    // 7️⃣ Observabilité
    recordAccepted(price.amount);
    auditStore.add({
      commandId,
      actorId: actor.actorId,
      commandName,
      status: 'accepted',
      createdAt: Date.now()
    });

    // 8️⃣ Persist idempotence
    idempotencyStore.set(commandId, result);

    return reply.send({
      status: 'accepted',
      command: commandName,
      cost: price,
      result
    });
  });
}
