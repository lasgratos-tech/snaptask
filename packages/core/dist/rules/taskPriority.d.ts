import type { TaskPriority } from "../domain/Task.types.js";
/**
 * Ordre métier des priorités
 */
export declare const PRIORITY_ORDER: Record<TaskPriority, number>;
/**
 * Compare deux priorités
 * > 0  => a plus prioritaire que b
 * < 0  => b plus prioritaire que a
 */
export declare function comparePriority(a: TaskPriority, b: TaskPriority): number;
/**
 * Retourne la priorité la plus élevée
 */
export declare function maxPriority(a: TaskPriority, b: TaskPriority): TaskPriority;
