import { PLAN_LIMITS } from "../rules/billing.js";
const usage = {};
/**
 * Vérifie et consomme un crédit de commande
 */
export function consumeCommand(userId, plan) {
    const limits = PLAN_LIMITS[plan];
    if (limits.dailyCommands === "unlimited")
        return;
    const used = usage[userId] ?? 0;
    if (used >= limits.dailyCommands) {
        throw new Error("Daily command limit reached");
    }
    usage[userId] = used + 1;
}
