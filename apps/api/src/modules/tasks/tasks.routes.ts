import type { FastifyInstance } from 'fastify'

import { taskRegistry } from './task.registry.js'

export async function tasksRoutes(app: FastifyInstance) {
  app.get('/v1/tasks/:taskCode/:version', async (request, reply) => {
    const { taskCode, version } = request.params as {
      taskCode: string
      version: string
    }

    const task = taskRegistry.get(taskCode, Number(version))

    if (!task) {
      return reply.code(404).send({ error: 'TASK_NOT_FOUND' })
    }

    return {
      taskCode: task.code,
      version: task.version,
      inputSchema: task.inputSchema,
      outputSchema: task.outputSchema,
    }
  })
}
