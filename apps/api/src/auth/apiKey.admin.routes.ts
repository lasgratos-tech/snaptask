import type { FastifyInstance } from 'fastify';
import { createApiKey, listApiKeys, revokeApiKey } from './apiKey.store';

export async function apiKeyAdminRoutes(app: FastifyInstance) {
  app.post('/admin/api-keys', async (request, reply) => {
    const { owner } = request.body as { owner: string };
    if (!owner) {
      return reply.status(400).send({ error: 'OWNER_REQUIRED' });
    }
    const key = createApiKey(owner);
    return reply.send(key);
  });

  app.get('/admin/api-keys', async () => {
    return listApiKeys();
  });

  app.delete('/admin/api-keys/:key', async (request, reply) => {
    const { key } = request.params as { key: string };
    const revoked = revokeApiKey(key);
    if (!revoked) {
      return reply.status(404).send({ error: 'API_KEY_NOT_FOUND' });
    }
    return reply.send({ success: true });
  });
}
