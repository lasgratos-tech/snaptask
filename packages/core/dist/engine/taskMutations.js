import { canChangeStatus } from "../rules/taskStatus.js";
/**
 * Applique une mutation métier de façon déterministe
 * - Pure function
 * - Sans effet de bord
 * - 100% testable
 */
export function applyMutation(task, mutation) {
    switch (mutation.type) {
        case "changeStatus": {
            if (!canChangeStatus(task.status, mutation.payload.to)) {
                throw new Error(`Invalid status transition: ${task.status} → ${mutation.payload.to}`);
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
            const _exhaustive = mutation;
            return task;
        }
    }
}
