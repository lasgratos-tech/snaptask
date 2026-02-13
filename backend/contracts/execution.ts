/**
 * CONTRAT — EXÉCUTION
 * Références constitutionnelles :
 * - Section 3 : exécution unique
 * - Section 2 : stateless, déterministe, amnésique
 */
export type ExecutionId = string;

export interface Execution {
  /**
   * Identifiant d’exécution unique.
   * Section 3 : s’exécute une seule fois.
   */
  id: ExecutionId;

  /**
   * Transaction déclenchante.
   * Section 4 : une transaction déclenche l’exécution.
   */
  transactionId: string;
}
