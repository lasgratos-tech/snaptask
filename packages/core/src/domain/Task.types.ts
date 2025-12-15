export type TaskStatus = "todo" | "doing" | "done";
export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;      // ISO date: YYYY-MM-DD
  createdAt: string;    // ISO datetime
  updatedAt: string;    // ISO datetime
}
