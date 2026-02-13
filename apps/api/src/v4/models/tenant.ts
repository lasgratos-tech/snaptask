/**
 * Tenant - Scoping pour RBAC v2
 * Chaque utilisateur appartient à un tenant
 * Les permissions peuvent être surchargées par tenant
 */
export interface Tenant {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

export interface TenantRoleOverride {
  tenantId: string
  role: string
  permissions: string[]
  createdAt: string
  updatedAt: string
}

/**
 * Par défaut, le tenantId est l'owner de l'utilisateur
 * Pour V4, on utilise un système simple où tenantId = owner
 */
export function getTenantIdFromUser(user: { owner: string; tenantId?: string }): string {
  return user.tenantId || user.owner
}
