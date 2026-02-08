import { randomUUID } from 'node:crypto';

import type { CreateTaskInput, TaskV5 } from './types.js';
import { getStoredTaskById, getStoredTasks, taskRepository } from './repository.js';

export const getAllTasks = (): TaskV5[] => getStoredTasks();

export const getTaskById = (id: string): TaskV5 | null =>
  getStoredTaskById(id);

export const createTask = (input: CreateTaskInput): TaskV5 => {
  const title = input.title.trim();
  if (!title) {
    throw new Error('INVALID_TITLE');
  }
  const task = taskRepository.create({ title });
  task.id = randomUUID();
  task.status = 'todo';
  return task;
};
