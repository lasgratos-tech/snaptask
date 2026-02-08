import type { FastifyPluginCallback } from 'fastify';

import { registerTasksRoutes } from './routes.js';

const tasksPlugin: FastifyPluginCallback = (app, _opts, done) => {
  registerTasksRoutes(app);
  done();
};

export default tasksPlugin;
