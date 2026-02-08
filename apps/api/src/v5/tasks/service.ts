import { randomUUID } from 'node:crypto';

import type { CreateTaskInput, TaskV5 } from './types.js';
import { taskRepository } from './repository.js';

export const getAllTasks = async (): Promise<TaskV5[]> =>
  taskRepository.findAll();

export const getTaskById = async (id: string): Promise<TaskV5 | null> =>
  taskRepository.findById(id);

export const createTask = async (input: CreateTaskInput): Promise<TaskV5> => {
  if (typeof input.title !== 'string') {
    throw new Error('TITLE_REQUIRED');
  }
  const title = input.title.trim();
  if (!title) {
    throw new Error('TITLE_REQUIRED');
  }
  if (title.length > 200) {
    throw new Error('TITLE_TOO_LONG');
  }
  const task: TaskV5 = {
    id: randomUUID(),
    title,
    status: 'todo'
  };
  return taskRepository.create(task);
};
