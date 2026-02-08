import type { FastifyInstance } from 'fastify';

import { requireUser } from '../auth/user.js';
import { checkRateLimit, RateLimitError } from '../rate-limit/limiter.js';
import type { CreateTaskInput } from './types.js';
import { createTask, getAllTasks, getTaskById } from './service.js';

export const registerTasksRoutes = (app: FastifyInstance) => {
  app.get('/', async (request, reply) => {
    const user = requireUser(request, reply);
    if (!user) {
      return;
    }
    return getAllTasks(user.id);
  });

  app.post<{ Body: CreateTaskInput }>('/', async (request, reply) => {
    const user = requireUser(request, reply);
    if (!user) {
      return;
    }
    try {
      checkRateLimit(user.id);
      const task = await createTask(request.body, user.id);
      app.log.info({ taskId: task.id, ownerId: user.id }, '[V5][tasks] created');
      return reply.code(201).send(task);
    } catch (error) {
      if (error instanceof Error) {
        if (error instanceof RateLimitError) {
          return reply.code(429).send({ error: 'rate limit exceeded' });
        }
        if (error.message === 'TITLE_REQUIRED' || error.message === 'TITLE_TOO_LONG') {
          app.log.warn({ reason: error.message, ownerId: user.id }, '[V5][tasks] validation rejected');
          return reply.code(400).send({ error: error.message });
        }
      }
      app.log.error('[V5][tasks] unexpected error');
      return reply.code(500).send({ error: 'INTERNAL_ERROR' });
    }
  });

  app.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const user = requireUser(request, reply);
    if (!user) {
      return;
    }
    const task = await getTaskById(request.params.id, user.id);
    if (!task) {
      return reply.code(404).send();
    }
    return task;
  });
};
