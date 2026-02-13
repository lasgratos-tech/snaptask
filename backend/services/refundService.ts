/**
 * SERVICE — RefundService
 * Références constitutionnelles :
 * - Section 2 : RCG™ livré ou remboursé
 * - Section 4 : remboursement automatique si livraison échoue
 */
export interface RefundService {
  refund(transactionId: string): void;
}
