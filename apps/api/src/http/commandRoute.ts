import type { FastifyInstance } from 'fastify';

import { idempotencyStore } from '../infra/idempotencyStore.js';


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

    // 2️⃣ ActorContext (temporaire, inline)
    const actor = {
      actorId: 'anonymous',
      provider: 'google',
      role: 'user',
      plan: 'free'
    };

    // 3️⃣ Pricing (fallback verrouillé)
    const price = {
  amount: 0,
  currency: 'USD'
};


    // 4️⃣ Quota check AVANT exécution
    

    // 5️⃣ Simulated execution (Core plus tard)
    const result =  {};
      });
}
