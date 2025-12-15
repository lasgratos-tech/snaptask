export type Plan = 'free' | 'paid';
export type Quota = {
    monthlyLimit: number;
};
export declare const PLAN_QUOTAS: Record<Plan, Quota>;
