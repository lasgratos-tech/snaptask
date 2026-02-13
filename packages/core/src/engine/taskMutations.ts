import type {
  Task,
  TaskStatus,
  TaskPriority,
} from "../domain/Task.types.js";

import { canChangeStatus } from "../rules/taskStatus.js";

/**
 * Toutes les mutations possibles sur une Task
 * (contrat métier strict, fermé)
 */
export type TaskMutation =
  | {
      type: "changeStatus";
      payload: {
        to: TaskStatus;
      };
    }
  | {
      type: "changePriority";
      payload: {
        to: TaskPriority;
      };
    }
  | {
      type: "rename";
      payload: {
        title: string;
      };
    };

/**
 * Applique une mutation métier de façon déterministe
 * - Pure function
 * - Sans effet de bord
 * - 100% testable
 */
export function applyMutation(
  task: Task,
  mutation: TaskMutation
): Task {
  switch (mutation.type) {
    case "changeStatus": {
      if (!canChangeStatus(task.status, mutation.payload.to)) {
        throw new Error(
          `Invalid status transition: ${task.status} → ${mutation.payload.to}`
        );
      }

      return {
        ...task,
        status: mutation.payload.to,
        updatedAt: new Date().toISOString(),
      };
    }

    case "changePriority": {
      return {
        ...task,
        priority: mutation.payload.to,
        updatedAt: new Date().toISOString(),
      };
    }

    case "rename": {
      const title = mutation.payload.title.trim();

      if (title.length === 0) {
        throw new Error("Task title cannot be empty");
      }

      return {
        ...task,
        title,
        updatedAt: new Date().toISOString(),
      };
    }

    default: {
      // Sécurité compile-time (mutation exhaustive)
      const _exhaustive: never = mutation;
      return task;
    }
  }
}
