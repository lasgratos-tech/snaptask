import type { TenantRoleOverride } from '../models/tenant.js'
import type { Permission } from '../models/permission.js'

/**
 * Stockage mock des surcharges de rôles par tenant
 * En production, ceci serait dans la base de données
 */
const tenantRoleOverrides: TenantRoleOverride[] = []

/**
 * Récupère les permissions d'un rôle pour un tenant donné
 * Si une surcharge existe, elle est utilisée, sinon les permissions par défaut
 */
export function getRolePermissionsForTenant(
  tenantId: string,
  role: string,
  defaultPermissions: Permission[],
): Permission[] {
  const override = tenantRoleOverrides.find(
    (o) => o.tenantId === tenantId && o.role === role,
  )

  if (override) {
    return override.permissions as Permission[]
  }

  return defaultPermissions
}

/**
 * Crée ou met à jour une surcharge de rôle pour un tenant
 */
export function setTenantRoleOverride(
  tenantId: string,
  role: string,
  permissions: Permission[],
): TenantRoleOverride {
  const existing = tenantRoleOverrides.findIndex(
    (o) => o.tenantId === tenantId && o.role === role,
  )

  const override: TenantRoleOverride = {
    tenantId,
    role,
    permissions: permissions as string[],
    createdAt: existing >= 0 ? tenantRoleOverrides[existing].createdAt : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  if (existing >= 0) {
    tenantRoleOverrides[existing] = override
  } else {
    tenantRoleOverrides.push(override)
  }

  return override
}

/**
 * Récupère toutes les surcharges pour un tenant
 */
export function getTenantRoleOverrides(tenantId: string): TenantRoleOverride[] {
  return tenantRoleOverrides.filter((o) => o.tenantId === tenantId)
}
