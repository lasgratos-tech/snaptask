export type AuditEventType =
  | 'TASK_EXECUTION_CREATED'
  | 'PROOF_UPLOADED'
  | 'PHOTO_PROOF_UPLOADED'
  | 'AIRBNB_PDF_GENERATED'
  | 'AIRBNB_DOCUMENT_GENERATED'
  | 'STATUS_CHANGED'
  | 'VALIDATION_APPROVED'
  | 'VALIDATION_REJECTED'
  | 'TASK_COMPLETED'
  | 'TASK_REJECTED'
  | 'PAYMENT_AUTHORIZED'
  | 'PAYMENT_CAPTURED'
  | 'PAYMENT_CANCELED'
  | 'TASK_STEP_CHANGED'
  | 'DISPUTE_OPENED'
  | 'DISPUTE_RESOLVED'
  | 'PAYMENT_REFUNDED'
  | 'PAYMENT_ON_HOLD'
  | 'STRIPE_PAYMENT_INTENT_CREATED'
  | 'STRIPE_PAYMENT_INTENT_CAPTURED'
  | 'STRIPE_PAYMENT_INTENT_CANCELED'
  | 'STRIPE_EVENT_RECEIVED'
  | 'STRIPE_EVENT_DUPLICATE'
  | 'ACCESS_GRANTED'
  | 'ACCESS_DENIED'
  | 'PRICING_UPDATED'
  | 'PERMISSION_GRANTED'
  | 'PERMISSION_REVOKED'
  | 'TENANT_ROLE_OVERRIDE_CREATED'
  | 'TENANT_ROLE_OVERRIDE_UPDATED'
  | 'USER_LOGIN'
  | 'USER_LOGOUT'
  | 'USER_REGISTERED'

export type AuditEntityType = 'task' | 'taskExecution' | 'proof' | 'dispute' | 'tenant' | 'pricing' | 'permission'

export type AuditActorType = 'user' | 'admin' | 'system'

export interface AuditLog {
  id: string
  eventType: AuditEventType
  entityType: AuditEntityType
  entityId: string
  actorType: AuditActorType
  actorId?: string
  metadata: Record<string, unknown>
  createdAt: string
}
