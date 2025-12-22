import type { FastifyInstance } from 'fastify';
import { executeTaskController } from './tasks.controller';
import { requireApiKey } from '../../auth/apiKey.guard';
import { requireRateLimit } from '../../rate-limit/rateLimit.guard';
import { ledgerBootstrap } from '../ledger/ledger.bootstrap';

export async function tasksRoutes(app: FastifyInstance) {
  app.post(
    '/v1/tasks/execute',
    {
      preHandler: [
        requireApiKey,      // 🔐 auth
        ledgerBootstrap,    // 💰 ledger garanti AVANT validation
        requireRateLimit,   // 🛡️ anti-abus
      ],
      schema: {
        body: {
          type: 'object',
          required: ['taskType', 'input'],
          properties: {
            taskType: { type: 'string' },
            input: { type: 'string' },
          },
        },
      },
    },
    executeTaskController
  );
}
