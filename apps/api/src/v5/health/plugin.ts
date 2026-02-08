import type { FastifyPluginCallback } from 'fastify';

import { registerHealthRoutes } from './routes.js';

const healthPlugin: FastifyPluginCallback = (app, _opts, done) => {
  registerHealthRoutes(app);
  done();
};

export default healthPlugin;
