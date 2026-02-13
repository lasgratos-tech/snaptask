import { UserRole } from '../models/user'
import { useAuth } from '../contexts/AuthContext'

export function useUserRole(): UserRole | null {
  const { user } = useAuth()
  return user ? (user.role as UserRole) : null
}
