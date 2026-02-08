import type { FastifyInstance } from 'fastify';

import { TaskListSchema } from './schema.js';

export function registerTasksRoutes(app: FastifyInstance) {
  app.get('/v5/tasks', async () => {
    const tasks = [
      { id: 't1', title: 'Premiere tache', status: 'todo' },
      { id: 't2', title: 'Deuxieme tache', status: 'done' },
      { id: 't3', title: 'Troisieme tache', status: 'todo' }
    ];

    TaskListSchema.parse(tasks);
    return tasks;
  });
}
