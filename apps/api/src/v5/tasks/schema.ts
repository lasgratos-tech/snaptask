export type Task = {
  id: string;
  title: string;
  status: 'todo' | 'done';
};

export const TaskSchema = {
  parse: (value: unknown): Task => value as Task
};

export const TaskListSchema = {
  parse: (value: unknown): Task[] => value as Task[]
};
