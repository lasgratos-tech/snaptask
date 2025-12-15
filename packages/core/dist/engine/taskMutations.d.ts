import type { Task, TaskStatus, TaskPriority } from "../domain/Task.types.js";
/**
 * Toutes les mutations possibles sur une Task
 * (contrat métier strict, fermé)
 */
export type TaskMutation = {
    type: "changeStatus";
    payload: {
        to: TaskStatus;
    };
} | {
    type: "changePriority";
    payload: {
        to: TaskPriority;
    };
} | {
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
export declare function applyMutation(task: Task, mutation: TaskMutation): Task;
