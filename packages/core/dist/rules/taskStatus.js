/**
 * Transitions autorisées entre statuts
 */
export const TASK_STATUS_TRANSITIONS = {
    todo: ["doing"],
    doing: ["todo", "done"],
    done: [],
};
/**
 * Vérifie si une transition est autorisée
 */
export function canChangeStatus(from, to) {
    return TASK_STATUS_TRANSITIONS[from].includes(to);
}
