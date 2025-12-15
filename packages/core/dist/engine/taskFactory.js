import { validateTask } from "../schemas/validateTask.js";
/**
 * Factory canonique de Task
 * AUCUNE tâche ne doit être créée ailleurs
 */
export function createTask(input) {
    const now = new Date().toISOString();
    const task = {
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
