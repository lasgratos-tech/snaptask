import type { FastifyInstance } from 'fastify';

import { registerTasksRoutes } from './tasks/index.js';

export function registerV5(app: FastifyInstance) {
  app.get('/v5/health', async () => {
    return { status: 'ok', version: 'v5' };
  });

  registerTasksRoutes(app);
}
