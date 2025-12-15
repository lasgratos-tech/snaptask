export type BillingPlan = "free" | "pro" | "enterprise";
export interface PlanLimits {
    dailyCommands: number | "unlimited";
}
