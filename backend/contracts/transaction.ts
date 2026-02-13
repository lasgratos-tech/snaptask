/**
 * CONTRAT — TRANSACTION
 * Références constitutionnelles :
 * - Section 4 : MODÈLE TRANSACTIONNEL
 * - Section 2 : 1 tâche = 1 résultat = 1 paiement
 */
export type TransactionId = string;

export interface Transaction {
  /**
   * Identifiant de transaction unitaire.
   * Section 4 : paiement unitaire.
   */
  id: TransactionId;

  /**
   * Référence à la task achetée.
   * Section 3 : task définie avant achat.
   */
  taskId: string;

  /**
   * Paiement avant exécution.
   * Section 4 : paiement avant exécution.
   */
  paidAt: string;
}
