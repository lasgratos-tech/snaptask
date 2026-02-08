import { inc, observe } from './store.js';

export const recordRequest = () => inc('v5.requests.total');
export const recordError = () => inc('v5.errors.total');
export const recordLatency = (ms: number) => observe('v5.latency.ms', ms);

export const recordTaskCreated = () => inc('tasks.created.count');
export const recordTaskCreatedError = () => inc('tasks.created.errors');
export const recordRateLimitHit = () => inc('rate_limit.hit.count');
