import type { FastifyInstance } from 'fastify';
import { requireRole } from '../auth/role.guard.js'
import prisma from '../prisma/client.js'
import { creditAccount } from './ledger.store.js'
import { ledgerRepository } from './ledger.repository.js'
import { z } from 'zod'

export async function ledgerRoutes(app: FastifyInstance) {
  /**
   * 👤 Historique utilisateur (ses propres transactions)
   */
  app.get('/ledger/me', async (request) => {
    if (request.user) {
      console.info(`[ledger][me] owner=${request.user.owner}`)
    }
    if (!request.user) {
      return []
    }
    const events = await prisma.ledgerEvent.findMany({
      where: { owner: request.user.owner },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    const balance = await ledgerRepository.getBalance(request.user.owner)
    return { balance, events }
  })

  /**
   * 🛠️ Historique admin (toutes les transactions)
   */
  app.get(
    '/admin/ledger',
    { preHandler: requireRole(['founder', 'admin']) },
    async (request, reply) => {
      const owner = (request.query as { owner?: string }).owner
      const limitRaw = (request.query as { limit?: string }).limit ?? '50'
      const limit = Math.min(200, Math.max(1, Number(limitRaw) || 50))
      console.info(`[ledger][admin] access owner=${owner ?? 'ALL'} limit=${limit}`)
      const events = await prisma.ledgerEvent.findMany({
        where: owner ? { owner } : undefined,
        orderBy: { createdAt: 'desc' },
        take: limit,
      })
      return reply.send({ events })
    },
  )

  /**
   * 🧪 DEV — Créditer un owner
   */
  const CreditSchema = z.object({
    owner: z.string().min(1),
    amountCents: z.number().int().positive(),
    reason: z.string().min(1).default('DEV_CREDIT'),
  })
  app.post(
    '/admin/ledger/credit',
    { preHandler: requireRole(['founder', 'admin']) },
    async (request, reply) => {
      if (process.env.NODE_ENV !== 'development') {
        return reply.status(403).send({ error: 'DEV_ONLY' })
      }
      const body = CreditSchema.parse(request.body)
      await creditAccount(body.owner, body.amountCents, body.reason)
      console.info(
        `[ledger][credit][dev] owner=${body.owner} amountCents=${body.amountCents} reason=${body.reason}`,
      )
      const balance = await ledgerRepository.getBalance(body.owner)
      return reply.send({ success: true, balance })
    },
  )

  /**
   * 🛠️ Solde d'un owner (admin)
   */
  app.get(
    '/admin/ledger/balance',
    { preHandler: requireRole(['founder', 'admin']) },
    async (request, reply) => {
      const owner = (request.query as { owner?: string }).owner
      if (!owner) {
        return reply.status(400).send({ error: 'OWNER_REQUIRED' })
      }
      const balance = await ledgerRepository.getBalance(owner)
      console.info(`[ledger][balance] owner=${owner} balance=${balance}`)
      return reply.send({ owner, balance })
    },
  )
}
