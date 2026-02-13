import { useAuth } from '../contexts/AuthContext'

/**
 * Hook pour obtenir l'API key depuis le contexte d'authentification
 * Remplace l'utilisation de VITE_API_KEY dans les composants
 */
export function useApiKey(): string | null {
  const { apiKey } = useAuth()
  return apiKey
}
