import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { UserRole, canAccessAdminPanel } from '../models/user'

interface ProtectedRouteProps {
  children: ReactNode
  requireAuth?: boolean
  requireRole?: UserRole[]
}

export function ProtectedRoute({
  children,
  requireAuth = true,
  requireRole,
}: ProtectedRouteProps) {
  const { isAuthenticated, user, loading } = useAuth()

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#0f172a',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <p>Chargement...</p>
      </div>
    )
  }

  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requireRole && user) {
    const userRole = user.role as UserRole
    const hasAccess = requireRole.some((role) => role === userRole) || canAccessAdminPanel(userRole)
    if (!hasAccess) {
      return <Navigate to="/catalogue" replace />
    }
  }

  return <>{children}</>
}
