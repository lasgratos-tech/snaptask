import type { BillingPlan, PlanLimits } from "../domain/BillingPlan.types.js";

export const PLAN_LIMITS: Record<BillingPlan, PlanLimits> = {
  free: {
    dailyCommands: 5,
  },
  pro: {
    dailyCommands: "unlimited",
  },
  enterprise: {
    dailyCommands: "unlimited",
  },
};
