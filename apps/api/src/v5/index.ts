import type { FastifyPluginCallback } from 'fastify';

import { isV5Enabled } from './config/flags.js';
import healthPlugin from './health/plugin.js';
import tasksPlugin from './tasks/plugin.js';

export const registerV5: FastifyPluginCallback = (app, _opts, done) => {
  if (!isV5Enabled()) {
    app.log.info('[V5] disabled');
    done();
    return;
  }

  app.register(healthPlugin);
  app.register(tasksPlugin, { prefix: '/tasks' });
  done();
};
