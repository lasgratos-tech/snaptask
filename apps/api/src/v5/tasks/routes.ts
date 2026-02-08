import type { FastifyInstance } from 'fastify';

import type { CreateTaskInput } from './types.js';
import { createTask, getAllTasks, getTaskById } from './service.js';

export const registerTasksRoutes = (app: FastifyInstance) => {
  app.get('/', async () => {
    return getAllTasks();
  });

  app.post<{ Body: CreateTaskInput }>('/', async (request, reply) => {
    try {
      const task = createTask(request.body);
      return reply.code(201).send(task);
    } catch {
      return reply.code(400).send();
    }
  });

  app.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const task = getTaskById(request.params.id);
    if (!task) {
      return reply.code(404).send();
    }
    return task;
  });
};
