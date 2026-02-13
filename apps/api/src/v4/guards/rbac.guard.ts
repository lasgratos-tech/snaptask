import type { FastifyRequest, FastifyReply } from 'fastify'
import type { Permission } from '../models/permission.js'
import { ROLE_PERMISSIONS, roleHasPermission } from '../models/permission.js'
import { getTenantIdFromUser } from '../models/tenant.js'
import { getRolePermissionsForTenant } from '../data/tenantRoles.js'
import { mapLegacyRole } from './role.guard.js'
import { createAuditLog } from '../data/auditLog.js'

/**
 * Vérifie si l'utilisateur a une permission donnée
 * Prend en compte les surcharges par tenant
 */
export function hasPermission(
  user: { owner: string; role: string; tenantId?: string },
  permission: Permission,
): boolean {
  const tenantId = getTenantIdFromUser(user)
  const role = mapLegacyRole(user.role || 'ops')
  const defaultPermissions = ROLE_PERMISSIONS[role] || []
  const effectivePermissions = getRolePermissionsForTenant(tenantId, role, defaultPermissions)

  return effectivePermissions.includes(permission)
}

/**
 * Guard RBAC v2 - Vérifie une permission et audit l'accès
 */
export function requirePermission(permission: Permission) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user
    if (!user) {
      await createAuditLog(
        'ACCESS_DENIED',
        'permission',
        permission,
        'system',
        undefined,
        {
          reason: 'UNAUTHORIZED',
          permission,
        },
      )
      return reply.code(401).send({ error: 'UNAUTHORIZED' })
    }

    const tenantId = getTenantIdFromUser(user)
    const hasAccess = hasPermission(user, permission)

    if (!hasAccess) {
      await createAuditLog(
        'ACCESS_DENIED',
        'permission',
        permission,
        'admin',
        user.owner,
        {
          tenantId,
          role: user.role,
          permission,
          reason: 'INSUFFICIENT_PERMISSIONS',
        },
      )
      return reply.code(403).send({
        error: 'FORBIDDEN',
        requiredPermission: permission,
        tenantId,
      })
    }

    // Audit accès accordé
    await createAuditLog(
      'ACCESS_GRANTED',
      'permission',
      permission,
      'admin',
      user.owner,
      {
        tenantId,
        role: user.role,
        permission,
      },
    )
  }
}

/**
 * Vérifie plusieurs permissions (OR logique)
 * L'utilisateur doit avoir au moins une des permissions
 */
export function requireAnyPermission(permissions: Permission[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user
    if (!user) {
      await createAuditLog(
        'ACCESS_DENIED',
        'permission',
        permissions.join('|'),
        'system',
        undefined,
        {
          reason: 'UNAUTHORIZED',
          permissions,
        },
      )
      return reply.code(401).send({ error: 'UNAUTHORIZED' })
    }

    const tenantId = getTenantIdFromUser(user)
    const hasAnyAccess = permissions.some((perm) => hasPermission(user, perm))

    if (!hasAnyAccess) {
      await createAuditLog(
        'ACCESS_DENIED',
        'permission',
        permissions.join('|'),
        'admin',
        user.owner,
        {
          tenantId,
          role: user.role,
          permissions,
          reason: 'INSUFFICIENT_PERMISSIONS',
        },
      )
      return reply.code(403).send({
        error: 'FORBIDDEN',
        requiredPermissions: permissions,
        tenantId,
      })
    }

    await createAuditLog(
      'ACCESS_GRANTED',
      'permission',
      permissions.join('|'),
      'admin',
      user.owner,
      {
        tenantId,
        role: user.role,
        permissions,
      },
    )
  }
}

/**
 * Vérifie plusieurs permissions (AND logique)
 * L'utilisateur doit avoir toutes les permissions
 */
export function requireAllPermissions(permissions: Permission[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user
    if (!user) {
      await createAuditLog(
        'ACCESS_DENIED',
        'permission',
        permissions.join('&'),
        'system',
        undefined,
        {
          reason: 'UNAUTHORIZED',
          permissions,
        },
      )
      return reply.code(401).send({ error: 'UNAUTHORIZED' })
    }

    const tenantId = getTenantIdFromUser(user)
    const hasAllAccess = permissions.every((perm) => hasPermission(user, perm))

    if (!hasAllAccess) {
      await createAuditLog(
        'ACCESS_DENIED',
        'permission',
        permissions.join('&'),
        'admin',
        user.owner,
        {
          tenantId,
          role: user.role,
          permissions,
          reason: 'INSUFFICIENT_PERMISSIONS',
        },
      )
      return reply.code(403).send({
        error: 'FORBIDDEN',
        requiredPermissions: permissions,
        tenantId,
      })
    }

    await createAuditLog(
      'ACCESS_GRANTED',
      'permission',
      permissions.join('&'),
      'admin',
      user.owner,
      {
        tenantId,
        role: user.role,
        permissions,
      },
    )
  }
}
