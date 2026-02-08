export type TaskStatus = 'todo' | 'done';

export interface TaskV5 {
  id: string;
  title: string;
  status: TaskStatus;
  ownerId: string;
}

export interface CreateTaskInput {
  title: string;
}
