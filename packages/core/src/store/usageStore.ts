import type { BillingPlan } from "../domain/BillingPlan.types.js";
import { PLAN_LIMITS } from "../rules/billing.js";

const usage: Record<string, number> = {};

/**
 * Vérifie et consomme un crédit de commande
 */
export function consumeCommand(
  userId: string,
  plan: BillingPlan
): void {
  const limits = PLAN_LIMITS[plan];

  if (limits.dailyCommands === "unlimited") return;

  const used = usage[userId] ?? 0;

  if (used >= limits.dailyCommands) {
    throw new Error("Daily command limit reached");
  }

  usage[userId] = used + 1;
}
