import type { FastifyInstance } from 'fastify'
import { taskOrchestrator } from '../../modules/tasks/task.orchestrator.js'
import { textSummarizeRoutes } from './textSummarize.routes.js'
import { cvInstantRoutes } from './cvInstant.routes.js'
// Fix: handle missing or incorrect import
// If "./textSummarize.routes" does not exist, comment or remove the import line below or correct the path.
// import { textSummarizeRoutes } from "./textSummarize.routes";

export async function registerTaskExecuteRoute(app: FastifyInstance) {
  app.post('/v1/tasks/execute', async (req, reply) => {
    const auth = req.headers.authorization
    if (!auth?.startsWith('Bearer ')) {
      return reply.code(401).send({ error: 'UNAUTHORIZED' })
    }

    const apiKey = auth.replace('Bearer ', '').trim()

    const body = req.body as {
      taskCode: string
      version: number
      input: unknown
      idempotencyKey?: string
    }

    const idempotencyKey = body.idempotencyKey ?? `${body.taskCode}:${Date.now()}`

    try {
      const result = await taskOrchestrator.execute({
        apiKey,
        taskCode: body.taskCode,
        taskVersion: body.version, // ✅ MAPPING CORRECT
        input: body.input,
        idempotencyKey,
      })

      return reply.send(result)
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
export async function bootstrapRoutes(app: FastifyInstance) {
  await registerTaskExecuteRoute(app);
  await textSummarizeRoutes(app);
  await cvInstantRoutes(app);
  
}