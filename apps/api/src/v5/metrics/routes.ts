import type { FastifyInstance } from 'fastify';

import { snapshot } from './store.js';

export const registerMetricsRoutes = (app: FastifyInstance) => {
  app.get('/metrics', async () => {
    return snapshot();
  });
};
