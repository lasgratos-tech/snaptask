import type { CreateTaskInput, TaskV5 } from './types.js';

const taskStore: TaskV5[] = [
  { id: 't1', title: 'Premiere tache', status: 'todo' },
  { id: 't2', title: 'Deuxieme tache', status: 'done' },
  { id: 't3', title: 'Troisieme tache', status: 'todo' }
];

export interface TaskRepository {
  create(input: CreateTaskInput): TaskV5;
}

export const taskRepository: TaskRepository = {
  create: (input) => {
    const task: TaskV5 = {
      id: '',
      title: input.title,
      status: 'todo'
    };
    taskStore.push(task);
    return task;
  }
};

export const getStoredTasks = (): TaskV5[] => taskStore;

export const getStoredTaskById = (id: string): TaskV5 | null =>
  taskStore.find(task => task.id === id) ?? null;
