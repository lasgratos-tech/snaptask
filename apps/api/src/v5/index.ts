import type { FastifyPluginCallback } from 'fastify';

import tasksPlugin from './tasks/index.js';

export const registerV5: FastifyPluginCallback = (app, _opts, done) => {
  app.get('/health', async () => {
    return { status: 'ok', version: 'v5' };
  });

  app.register(tasksPlugin);
  done();
};
