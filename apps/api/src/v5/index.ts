import type { FastifyPluginCallback } from 'fastify';

import { isV5Enabled } from './config/flags.js';
import healthPlugin from './health/plugin.js';
import { registerMetricsRoutes } from './metrics/routes.js';
import tasksPlugin from './tasks/plugin.js';

export const registerV5: FastifyPluginCallback = (app, _opts, done) => {
  if (!isV5Enabled()) {
    app.log.info('[V5] disabled');
    done();
    return;
  }

  app.register(async (v5App) => {
    v5App.addHook('preHandler', async (request, reply) => {
      const userId = request.headers['x-user-id'];
      if (typeof userId !== 'string' || !userId.trim()) {
        reply.code(401).send({ error: 'unauthorized' });
        return;
      }
    });

    v5App.register(healthPlugin);
    registerMetricsRoutes(v5App);
    v5App.register(tasksPlugin, { prefix: '/tasks' });
  });
  done();
};
