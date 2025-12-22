import type { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '@/prisma/client';

export async function apiKeyAuth(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const apiKey = request.headers['x-api-key'];

  if (!apiKey || typeof apiKey !== 'string') {
    return reply.status(401).send({ 
      error: 'API_KEY_MISSING' });
  }

  const key = await prisma.apiKey.findUnique({
    where: { key: apiKey },
  });

  if (!key || key.revokedAt) {
    return reply.status(401).send({ error: 'API_KEY_INVALID' });
  }

  // contexte sécurisé
  request.user = { owner: key.owner };
}
