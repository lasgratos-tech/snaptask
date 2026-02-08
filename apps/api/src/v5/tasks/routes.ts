import type { FastifyInstance } from 'fastify';

import { getAllTasks, getTaskById } from './service.js';

export const registerTasksRoutes = (app: FastifyInstance) => {
  app.get('/', async () => {
    return getAllTasks();
  });

  app.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const task = getTaskById(request.params.id);
    if (!task) {
      return reply.code(404).send();
    }
    return task;
  });
};
