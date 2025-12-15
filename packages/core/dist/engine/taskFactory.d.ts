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
export declare function createTask(input: CreateTaskInput): Task;
