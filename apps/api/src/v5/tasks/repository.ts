import type { TaskV5 } from './types.js';

import { getDb } from '../db/client.js';

const taskStore: TaskV5[] = [
  { id: 't1', title: 'Premiere tache', status: 'todo' },
  { id: 't2', title: 'Deuxieme tache', status: 'done' },
  { id: 't3', title: 'Troisieme tache', status: 'todo' }
];

export interface TaskRepository {
  create(task: TaskV5): Promise<TaskV5>;
  findAll(): Promise<TaskV5[]>;
  findById(id: string): Promise<TaskV5 | null>;
}

export const taskRepository: TaskRepository = {
  create: async (task) => {
    const db = getDb();
    if (!db) {
      taskStore.push(task);
      return task;
    }
    await db.query(
      'INSERT INTO tasks_v5 (id, title, status) VALUES ($1, $2, $3)',
      [task.id, task.title, task.status],
    );
    return task;
  },
  findAll: async () => {
    const db = getDb();
    if (!db) {
      return taskStore;
    }
    const result = await db.query<TaskV5>(
      'SELECT id, title, status FROM tasks_v5',
    );
    return result.rows;
  },
  findById: async (id) => {
    const db = getDb();
    if (!db) {
      return taskStore.find(task => task.id === id) ?? null;
    }
    const result = await db.query<TaskV5>(
      'SELECT id, title, status FROM tasks_v5 WHERE id = $1',
      [id],
    );
    return result.rows[0] ?? null;
  }
};
