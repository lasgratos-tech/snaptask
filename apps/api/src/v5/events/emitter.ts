import type { V5Event } from './types.js';
import { handleAuditLog } from './handlers/audit-log.js';

const handlers = [handleAuditLog];

export const emit = (event: V5Event): void => {
  handlers.forEach((handler) => {
    try {
      handler(event);
    } catch {
      // Eventing must never break request flow.
    }
  });
};
