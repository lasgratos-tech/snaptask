import { AuditLog, AuditEventType, AuditEntityType, AuditActorType } from '../models/audit.js'

const auditLogs: AuditLog[] = []

export function createAuditLog(
  eventType: AuditEventType,
  entityType: AuditEntityType,
  entityId: string,
  actorType: AuditActorType,
  actorId?: string,
  metadata: Record<string, unknown> = {},
): AuditLog {
  const log: AuditLog = {
    id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    eventType,
    entityType,
    entityId,
    actorType,
    actorId,
    metadata,
    createdAt: new Date().toISOString(),
  }

  auditLogs.push(log)
  return log
}

export function getAuditLogsByEntityId(
  entityType: AuditEntityType,
  entityId: string,
): AuditLog[] {
  return auditLogs
    .filter((log) => log.entityType === entityType && log.entityId === entityId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function getAllAuditLogs(limit = 100): AuditLog[] {
  return auditLogs
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit)
}

export function getAuditLogsByTaskExecutionId(taskExecutionId: string): AuditLog[] {
  return auditLogs
    .filter((log) => log.entityId === taskExecutionId && log.entityType === 'taskExecution')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

/**
 * Vérifie si un événement Stripe a déjà été traité (idempotence)
 */
export function hasStripeEventBeenProcessed(stripeEventId: string): boolean {
  return auditLogs.some(
    (log) =>
      log.eventType === 'STRIPE_EVENT_RECEIVED' &&
      log.metadata?.stripeEventId === stripeEventId,
  )
}
