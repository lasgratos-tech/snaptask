import type { FastifyInstance, FastifyPluginCallback } from 'fastify';

import { registerTasksRoutes } from './tasks/index.js';

const v5Plugin: FastifyPluginCallback = (app, _opts, done) => {
  app.get('/health', async () => {
    return { status: 'ok', version: 'v5' };
  });

  registerTasksRoutes(app);
  done();
};

export function registerV5(app: FastifyInstance) {
  app.register(v5Plugin, { prefix: '/v5' });
}
