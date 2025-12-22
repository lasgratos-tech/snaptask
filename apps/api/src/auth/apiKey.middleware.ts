import type { FastifyReply, FastifyRequest } from 'fastify';
import { getApiKeyOwner } from './apiKey.service';

export async function apiKeyAuthMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const apiKey = request.headers['x-api-key'];

  if (!apiKey || typeof apiKey !== 'string') {
    return reply.status(401).send({
      error: 'API_KEY_MISSING',
    });
  }

  const owner = await getApiKeyOwner(apiKey);

  if (!owner) {
    return reply.status(403).send({
      error: 'API_KEY_INVALID',
    });
  }

  // 🔐 contexte auth injecté
  request.user = {
    apiKey,
    owner,
  };
}
