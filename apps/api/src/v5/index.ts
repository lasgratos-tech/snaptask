import type { FastifyInstance } from 'fastify';

export function registerV5(app: FastifyInstance) {
  app.get('/v5/health', async () => {
    return { status: 'ok', version: 'v5' };
  });
}
