import type { FastifyReply, FastifyRequest } from 'fastify'
import { executeTask } from './tasks.service.js'
import { taskExecutionCounter } from './tasks.metrics.js'
import { debitAccount } from '../../ledger/ledger.store.js'
import { getTaskCost } from '../../pricing/pricing.service.js'

export async function executeTaskController(
  request: FastifyRequest<{
    Body: { taskCode: string; input: unknown }
  }>,
  reply: FastifyReply
) {
  const user = request.user

  if (!user) {
    return reply.status(401).send({ error: 'UNAUTHORIZED' })
  }

  let cost: number

  try {
    cost = getTaskCost(request.body.taskCode as any)
  } catch {
    return reply.status(400).send({
      error: 'TASK_NOT_PRICED',
      message: 'No pricing defined for this task type',
    })
  }

  try {
    // 💳 Débit dynamique selon le pricing
    debitAccount(user.owner, cost, `task:${request.body.taskCode}`)
  } catch (err) {
    if (err instanceof Error && err.message === 'INSUFFICIENT_CREDITS') {
      return reply.status(402).send({
        error: 'INSUFFICIENT_CREDITS',
        requiredCredits: cost,
      })
    }
    throw err
  }

  const result = await executeTask(request.body)

  taskExecutionCounter.inc({
    taskType: request.body.taskCode,
  })

  return reply.status(200).send({
    success: true,
    costCredits: cost,
    data: result,
  })
}
