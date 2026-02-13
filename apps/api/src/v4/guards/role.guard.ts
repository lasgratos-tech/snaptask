import type { FastifyRequest, FastifyReply } from 'fastify'
import { UserRole, canValidate, canAccessAudit, canUploadProof, canAccessAdminPanel } from '../models/role.js'

export function mapLegacyRole(role: string): UserRole {
  if (role === 'founder' || role === 'admin') {
    return 'admin'
  }
  if (role === 'client') {
    return 'ops'
  }
  return role as UserRole
}

export function requireRole(allowedRoles: UserRole[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user
    if (!user) {
      return reply.code(401).send({ error: 'UNAUTHORIZED' })
    }

    const userRole = mapLegacyRole(user.role || 'ops')
    if (!allowedRoles.includes(userRole)) {
      return reply.code(403).send({ error: 'FORBIDDEN', requiredRoles: allowedRoles })
    }
  }
}

export function requireAdmin() {
  return requireRole(['admin'])
}

export function requireReviewer() {
  return requireRole(['admin', 'reviewer'])
}

export function requireOps() {
  return requireRole(['ops', 'admin'])
}

export function checkCanValidate(request: FastifyRequest): boolean {
  const user = (request as any).user
  if (!user) return false
  return canValidate(mapLegacyRole(user.role || 'ops'))
}

export function checkCanAccessAudit(request: FastifyRequest): boolean {
  const user = (request as any).user
  if (!user) return false
  return canAccessAudit(mapLegacyRole(user.role || 'ops'))
}

export function checkCanUploadProof(request: FastifyRequest): boolean {
  const user = (request as any).user
  if (!user) return false
  return canUploadProof(mapLegacyRole(user.role || 'ops'))
}

export function checkCanAccessAdminPanel(request: FastifyRequest): boolean {
  const user = (request as any).user
  if (!user) return false
  return canAccessAdminPanel(mapLegacyRole(user.role || 'ops'))
}
