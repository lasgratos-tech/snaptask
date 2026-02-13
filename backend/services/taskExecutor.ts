import type { Execution } from "../contracts/execution.js";

/**
 * SERVICE — TaskExecutor (stateless)
 * Références constitutionnelles :
 * - Section 2 : stateless, déterministe, amnésique
 * - Section 3 : exécution unique
 */
export interface TaskExecutor {
  execute(
    taskId: string,
    inputs: Record<string, unknown>,
  ): {
    execution: Execution;
    outputs: Record<string, unknown>;
  };
}
