import type { FastifyPluginCallback } from 'fastify';

import { TaskListSchema } from './schema.js';

export const registerTasksRoutes: FastifyPluginCallback = (app, _opts, done) => {
  app.get('/tasks', async () => {
    const tasks = [
      { id: 't1', title: 'Premiere tache', status: 'todo' },
      { id: 't2', title: 'Deuxieme tache', status: 'done' },
      { id: 't3', title: 'Troisieme tache', status: 'todo' }
    ];

    TaskListSchema.parse(tasks);
    return tasks;
  });
  done();
};
