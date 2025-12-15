import { validateTask } from "../schemas/validateTask.js";
import type { Task, TaskPriority } from "../domain/Task.types.js";

/**
 * Input minimal pour créer une tâche
 */
export type CreateTaskInput = {
  title: string;
  priority?: TaskPriority;
};

/**
 * Factory canonique de Task
 * AUCUNE tâche ne doit être créée ailleurs
 */
export function createTask(input: CreateTaskInput): Task {
  const now = new Date().toISOString();

  const task: Task = {
    id: crypto.randomUUID(),
    title: input.title.trim(),
    status: "todo",
    priority: input.priority ?? "medium",
    createdAt: now,
    updatedAt: now,
  };

  validateTask(task);

  return task;
}
