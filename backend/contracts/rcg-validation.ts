/**
 * CONTRAT — VALIDATION RCG™
 * Références constitutionnelles :
 * - Section 2 : RCG™ livré ou remboursé
 * - Section 4 : validation avant livraison
 */
export type RcgValidationStatus = "DELIVERED" | "REFUNDED";

export interface RcgValidation {
  /**
   * Référence d’exécution.
   * Section 4 : validation après exécution.
   */
  executionId: string;

  /**
   * Statut binaire RCG™.
   * Section 2 + Section 4 : livré ou remboursé.
   */
  status: RcgValidationStatus;
}
