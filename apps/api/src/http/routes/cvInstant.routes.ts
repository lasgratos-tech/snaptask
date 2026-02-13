import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { runCvInstant } from '../../tasks/cvInstant/handler.js'
import { ledgerRepository } from '../../ledger/ledger.repository.js'

const BodySchema = z.object({
  image: z.string().min(1).optional(),
  targetRole: z.string().min(1),
  language: z.enum(['fr', 'en']).default('fr'),
  style: z.enum(['classic', 'modern', 'executive']).default('classic'),
  includeCoverLetter: z.boolean().default(true),
})

export async function cvInstantRoutes(app: FastifyInstance) {
  app.post('/v1/tasks/cv-instant', async (req, reply) => {
    const body = BodySchema.parse(req.body)
    const user = (req as any).user

    if (!user?.owner) {
      return reply.status(401).send({ error: 'UNAUTHORIZED' })
    }

    if (process.env.NODE_ENV !== 'development' && !body.image) {
      return reply.status(400).send({ error: 'IMAGE_REQUIRED' })
    }

    const result = await runCvInstant({
      image: body.image,
      targetRole: body.targetRole,
      language: body.language,
      style: body.style,
      includeCoverLetter: body.includeCoverLetter,
    })

    const amountCents = Math.ceil(result.cost * 100)
    const balance = await ledgerRepository.getBalance(user.owner)

    if (balance < amountCents) {
      return reply.status(402).send({
        error: 'INSUFFICIENT_FUNDS',
        requiredCents: amountCents,
        currency: result.currency,
      })
    }

    await ledgerRepository.debit({
      userId: user.owner,
      amountCents,
      currency: result.currency,
      idempotencyKey: `CV_INSTANT:${Date.now()}`,
      reason: 'CV_INSTANT',
    })

    return reply.send(result)
  })
}
