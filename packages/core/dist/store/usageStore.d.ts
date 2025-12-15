import type { BillingPlan } from "../domain/BillingPlan.types.js";
/**
 * Vérifie et consomme un crédit de commande
 */
export declare function consumeCommand(userId: string, plan: BillingPlan): void;
