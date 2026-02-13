import type { TaskStatus } from "../domain/Task.types.js";

/**
 * Transitions autorisées entre statuts
 */
export const TASK_STATUS_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  todo: ["doing"],
  doing: ["todo", "done"],
  done: [],
};

/**
 * Vérifie si une transition est autorisée
 */
export function canChangeStatus(
  from: TaskStatus,
  to: TaskStatus
): boolean {
  return TASK_STATUS_TRANSITIONS[from].includes(to);
}
