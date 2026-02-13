import type { PrismaClient } from '@prisma/client'
import type { LedgerCreateInput } from './ledger.types.js'
import { LedgerRepository } from './ledger.repository.js'

export class CompensationService {
  private ledger = new LedgerRepository()

  /**
   * Écrit un CREDIT compensatoire.
   * 🔒 Append-only
   * 🔒 Idempotent par contrainte DB
   */
  async compensate(params: {
    originalIdempotencyKey: string
    userId: string
    taskCode: string
    amountCents: number
    currency: string
    reason: string
    tx?: PrismaClient
  }) {
    const compensationKey = `COMPENSATION:${params.originalIdempotencyKey}`

    const input: LedgerCreateInput & { tx?: PrismaClient } = {
      userId: params.userId,
      taskCode: params.taskCode,
      direction: 'CREDIT',
      amountCents: params.amountCents,
      currency: params.currency,
      idempotencyKey: compensationKey,
      metadata: {
        originalIdempotencyKey: params.originalIdempotencyKey,
        reason: params.reason,
      },
      tx: params.tx,
    }

    try {
      return await this.ledger.create(input)
    } catch (err) {
      // 🔒 Idempotency guaranteed by DB unique constraint
      if (err instanceof Error && err.message.includes('Unique constraint')) {
        throw new Error('COMPENSATION_ALREADY_APPLIED')
      }
      throw err
    }
  }
}
