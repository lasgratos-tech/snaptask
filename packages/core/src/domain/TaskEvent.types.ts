import type { TaskMutation } from "../engine/taskMutations.js";

/**
 * Événement métier immuable
 * Source de vérité pour l’event sourcing
 */
export interface TaskEvent {
  taskId: string;
  mutation: TaskMutation;
  timestamp: string; // ISO datetime
}
