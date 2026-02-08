import type { TaskV5 } from './types.js';

const tasks: TaskV5[] = [
  { id: 't1', title: 'Premiere tache', status: 'todo' },
  { id: 't2', title: 'Deuxieme tache', status: 'done' },
  { id: 't3', title: 'Troisieme tache', status: 'todo' }
];

export const getAllTasks = (): TaskV5[] => tasks;

export const getTaskById = (id: string): TaskV5 | null =>
  tasks.find(task => task.id === id) ?? null;
