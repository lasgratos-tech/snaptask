import prisma from '../../prisma/client.js'
import type { FastifyRequest, FastifyReply } from 'fastify';

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {

  const apiKey = request.headers['x-api-key'];

  if (!apiKey) {
    return reply.code(401).send({ error: 'API_KEY_MISSING' });
  }

  const key = await prisma.apiKey.findUnique({
    where: { key: Array.isArray(apiKey) ? apiKey[0] : apiKey },

  });

  if (!key || key.revokedAt) {
    return reply.code(401).send({ error: 'API_KEY_INVALID' });
  }

  const owner = key.owner;

  /**
   * 🔒 BOOTSTRAP LEDGER
   * Garantie systémique :
   * - 0 ou 1 LedgerAccount
   * - jamais plus
   * - jamais moins
   */
  // LedgerService not available in this scope (stabilisation)

  request.user = {
  apiKey: key.key,
  owner: key.owner,
};

};

