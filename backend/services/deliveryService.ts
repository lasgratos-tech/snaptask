import type { Delivery } from "../contracts/delivery.js";

/**
 * SERVICE — DeliveryService
 * Références constitutionnelles :
 * - Section 3 : livrable exploitable, résultat figé
 * - Section 4 : livraison après validation
 */
export interface DeliveryService {
  deliver(executionId: string, resultRef: string): Delivery;
}
