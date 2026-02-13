export type UserRole = 'admin' | 'ops' | 'reviewer'

export interface User {
  id: string
  role: UserRole
}

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
