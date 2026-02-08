import type { FastifyInstance } from 'fastify';

import type { CreateTaskInput } from './types.js';
import { createTask, getAllTasks, getTaskById } from './service.js';

export const registerTasksRoutes = (app: FastifyInstance) => {
  app.get('/', async () => {
    return getAllTasks();
  });

  app.post<{ Body: CreateTaskInput }>('/', async (request, reply) => {
    try {
      const task = await createTask(request.body);
      app.log.info({ taskId: task.id }, '[V5][tasks] created');
      return reply.code(201).send(task);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'TITLE_REQUIRED' || error.message === 'TITLE_TOO_LONG') {
          app.log.warn({ reason: error.message }, '[V5][tasks] validation rejected');
          return reply.code(400).send({ error: error.message });
        }
      }
      app.log.error('[V5][tasks] unexpected error');
      return reply.code(500).send({ error: 'INTERNAL_ERROR' });
    }
  });

  app.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const task = await getTaskById(request.params.id);
    if (!task) {
      return reply.code(404).send();
    }
    return task;
  });
};
