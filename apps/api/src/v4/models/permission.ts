/**
 * RBAC v2 - Permissions atomiques
 * Chaque permission est atomique et vérifiable indépendamment
 */
export type Permission =
  | 'task.read'
  | 'task.execute'
  | 'proof.upload'
  | 'validation.approve'
  | 'validation.reject'
  | 'audit.read'
  | 'finance.read'
  | 'pricing.manage'
  | 'catalog.manage'
  | 'tenant.manage'

export const PERMISSIONS = {
  TASK_READ: 'task.read' as const,
  TASK_EXECUTE: 'task.execute' as const,
  PROOF_UPLOAD: 'proof.upload' as const,
  VALIDATION_APPROVE: 'validation.approve' as const,
  VALIDATION_REJECT: 'validation.reject' as const,
  AUDIT_READ: 'audit.read' as const,
  FINANCE_READ: 'finance.read' as const,
  PRICING_MANAGE: 'pricing.manage' as const,
  CATALOG_MANAGE: 'catalog.manage' as const,
  TENANT_MANAGE: 'tenant.manage' as const,
} as const

/**
 * Mapping des rôles vers leurs permissions par défaut
 * Peut être surchargé par tenant
 */
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  admin: [
    'task.read',
    'task.execute',
    'proof.upload',
    'validation.approve',
    'validation.reject',
    'audit.read',
    'finance.read',
    'pricing.manage',
    'catalog.manage',
    'tenant.manage',
  ],
  reviewer: [
    'task.read',
    'validation.approve',
    'validation.reject',
    'audit.read',
    'finance.read',
  ],
  ops: [
    'task.read',
    'task.execute',
    'proof.upload',
  ],
}

/**
 * Vérifie si un rôle a une permission donnée
 */
export function roleHasPermission(role: string, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role] || []
  return permissions.includes(permission)
}
