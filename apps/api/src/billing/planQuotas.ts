export type Plan = 'free' | 'paid';

export type Quota = {
  monthlyLimit: number; // en cents
};

export const PLAN_QUOTAS: Record<Plan, Quota> = {
  free: {
    monthlyLimit: 500 // 5 NOK
  },
  paid: {
    monthlyLimit: 10_000 // 100 NOK
  }
};
