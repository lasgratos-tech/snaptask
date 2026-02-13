export type UserRole = 'admin' | 'ops' | 'reviewer'

export const ROLES = {
  ADMIN: 'admin' as const,
  OPS: 'ops' as const,
  REVIEWER: 'reviewer' as const,
} as const

export function canValidate(role: UserRole): boolean {
  return role === 'admin' || role === 'reviewer'
}

export function canAccessAudit(role: UserRole): boolean {
  return role === 'admin' || role === 'reviewer'
}

export function canUploadProof(role: UserRole): boolean {
  return role === 'ops' || role === 'admin'
}

export function canAccessAdminPanel(role: UserRole): boolean {
  return role === 'admin'
}
