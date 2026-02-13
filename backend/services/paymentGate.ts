import type { Transaction } from "../contracts/transaction.js";

/**
 * SERVICE — PaymentGate (mockable)
 * Références constitutionnelles :
 * - Section 4 : paiement avant exécution
 * - Section 2 : 1 tâche = 1 résultat = 1 paiement
 */
export interface PaymentGate {
  charge(taskId: string, amount: number, currency: string): Transaction;
}
