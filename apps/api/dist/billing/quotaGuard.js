import { PLAN_QUOTAS } from './planQuotas.js';
import { billingStore } from './billingStore.js';
export function assertQuota(params) {
    const quota = PLAN_QUOTAS[params.plan];
    const spent = billingStore.totalForActor(params.actorId);
    if (spent + params.cost > quota.monthlyLimit) {
        throw new Error('QUOTA_EXCEEDED');
    }
}
//# sourceMappingURL=quotaGuard.js.map