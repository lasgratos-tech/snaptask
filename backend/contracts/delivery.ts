/**
 * CONTRAT — LIVRAISON
 * Références constitutionnelles :
 * - Section 3 : livrable exploitable
 * - Section 4 : transaction -> livraison
 */
export type DeliveryId = string;

export interface Delivery {
  /**
   * Identifiant de livraison.
   * Section 4 : la transaction déclenche la livraison.
   */
  id: DeliveryId;

  /**
   * Exécution source.
   * Section 4 : exécution -> validation -> livraison.
   */
  executionId: string;

  /**
   * Résultat figé.
   * Section 3 : résultat attendu explicite, livrable exploitable.
   */
  resultRef: string;
}
