import type { TaskV5 } from './types.js';

import { getDb } from '../db/client.js';

const taskStore: TaskV5[] = [
  { id: 't1', title: 'Premiere tache', status: 'todo', ownerId: 'seed' },
  { id: 't2', title: 'Deuxieme tache', status: 'done', ownerId: 'seed' },
  { id: 't3', title: 'Troisieme tache', status: 'todo', ownerId: 'seed' }
];

export interface TaskRepository {
  create(task: TaskV5, ownerId: string): Promise<TaskV5>;
  findAll(ownerId: string): Promise<TaskV5[]>;
  findById(id: string, ownerId: string): Promise<TaskV5 | null>;
}

export const taskRepository: TaskRepository = {
  create: async (task, ownerId) => {
    const db = getDb();
    const storedTask = { ...task, ownerId };
    if (!db) {
      taskStore.push(storedTask);
      return storedTask;
    }
    await db.query(
      'INSERT INTO tasks_v5 (id, title, status, owner_id) VALUES ($1, $2, $3, $4)',
      [storedTask.id, storedTask.title, storedTask.status, storedTask.ownerId],
    );
    return storedTask;
  },
  findAll: async (ownerId) => {
    const db = getDb();
    if (!db) {
      return taskStore.filter(task => task.ownerId === ownerId);
    }
    const result = await db.query<TaskV5>(
      'SELECT id, title, status, owner_id as "ownerId" FROM tasks_v5 WHERE owner_id = $1',
      [ownerId],
    );
    return result.rows;
  },
  findById: async (id, ownerId) => {
    const db = getDb();
    if (!db) {
      return taskStore.find(task => task.id === id && task.ownerId === ownerId) ?? null;
    }
    const result = await db.query<TaskV5>(
      'SELECT id, title, status, owner_id as "ownerId" FROM tasks_v5 WHERE id = $1 AND owner_id = $2',
      [id, ownerId],
    );
    return result.rows[0] ?? null;
  }
};
