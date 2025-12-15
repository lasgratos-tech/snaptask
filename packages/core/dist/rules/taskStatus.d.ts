import type { TaskStatus } from "../domain/Task.types.js";
/**
 * Transitions autorisées entre statuts
 */
export declare const TASK_STATUS_TRANSITIONS: Record<TaskStatus, TaskStatus[]>;
/**
 * Vérifie si une transition est autorisée
 */
export declare function canChangeStatus(from: TaskStatus, to: TaskStatus): boolean;
