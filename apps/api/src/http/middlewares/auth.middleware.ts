import type { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '@/prisma/client';
import { LedgerService } from '@/domain/ledger/ledger/service';

/**
 * Middleware d’authentification SnapTask
 * - Valide l’API Key
 * - Hydrate request.user
 * - Garantit l’existence du LedgerAccount
 *
 * ⚠️ NE JAMAIS :
 * - débiter
 * - créditer
 * - modifier le solde
 */
export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const apiKey = request.headers['x-api-key'];

  if (!apiKey || typeof apiKey !== 'string') {
    return reply.status(401).send({
      error: 'API_KEY_MISSING',
    });
  }

  const key = await prisma.apiKey.findUnique({
    where: { key: apiKey },
  });

  if (!key || key.revokedAt) {
    return reply.status(401).send({
      error: 'API_KEY_INVALID',
    });
  }

  const owner = key.owner;

  // 🔒 Garantie structurelle : le compte existe (sans effet de bord)
  await LedgerService.ensureAccount(owner);

  // 🔐 Contexte sécurisé pour les routes
  request.user = {
    owner,
  };
}
