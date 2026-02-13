import type { FastifyInstance } from 'fastify'

import { TaskExecuteInputSchema } from '../contracts/task.execute.contract.js'
import { taskOrchestrator } from '../../modules/tasks/task.orchestrator.js'

export async function taskExecuteRoutes(app: FastifyInstance) {
  app.post('/v1/tasks/execute', async (request, reply) => {
    // 🔐 Auth hard check
    if (!request.user) {
      return reply.code(401).send({ error: 'UNAUTHORIZED' })
    }

    // 🧾 Input validation
    const parsed = TaskExecuteInputSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.code(400).send({ error: 'INVALID_INPUT' })
    }

    const { taskType, input } = parsed.data
    const TASK_VERSION = 1

    try {
      const idempotencyKey = crypto.randomUUID()

      const result = await taskOrchestrator.execute({
  apiKey,
  taskCode: body.taskCode,
  taskVersion: body.version,
  input: body.input,
  idempotencyKey,
})


      return {
        taskId: `${taskType}@v${TASK_VERSION}`,
        result,
      }
    } catch (err) {
      if (err instanceof Error) {
        return reply.code(400).send({
          error: 'TASK_EXECUTION_FAILED',
          message: err.message,
        })
      }

      return reply.code(500).send({ error: 'INTERNAL_ERROR' })
    }
  })
}
