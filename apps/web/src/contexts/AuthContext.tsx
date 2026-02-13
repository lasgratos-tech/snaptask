import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

const API_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

interface User {
  id: string
  owner: string
  role: string
}

interface AuthContextType {
  user: User | null
  apiKey: string | null
  loading: boolean
  loginByApiKey: (apiKey: string) => Promise<{ role: string }>
  loginByEmail: (email: string) => Promise<{ role: string }>
  register: (email: string) => Promise<{ role: string }>
  logout: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const STORAGE_KEY = 'snaptask_api_key'

function parseError(res: Response, body: { error?: string }): string {
  const code = body?.error
  if (code === 'INVALID_EMAIL') return 'Email invalide.'
  if (code === 'USER_ALREADY_EXISTS') return 'Un compte existe déjà avec cet email.'
  if (code === 'USER_NOT_FOUND') return 'Aucun compte avec cet email.'
  if (code === 'INVALID_API_KEY' || code === 'MISSING_API_KEY') return 'Clé API invalide ou manquante.'
  if (code === 'REGISTRATION_FAILED') return 'Erreur lors de l\'inscription.'
  if (code === 'LOGIN_FAILED') return 'Erreur lors de la connexion.'
  if (res.status >= 500) return 'Erreur serveur. Réessayez plus tard.'
  if (res.status === 401) return 'Connexion refusée.'
  return body?.error || 'Une erreur est survenue.'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedApiKey = localStorage.getItem(STORAGE_KEY)
    if (storedApiKey) {
      setApiKey(storedApiKey)
      loadUser(storedApiKey)
    } else {
      setLoading(false)
    }
  }, [])

  async function loadUser(key: string) {
    try {
      const res = await fetch(`${API_URL}/auth/login-api-key`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: key }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        setUser({
          id: data.email,
          owner: data.email,
          role: data.role || 'user',
        })
      } else {
        localStorage.removeItem(STORAGE_KEY)
        setApiKey(null)
        setUser(null)
      }
    } catch (_err) {
      localStorage.removeItem(STORAGE_KEY)
      setApiKey(null)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  async function loginByApiKey(apiKeyValue: string): Promise<{ role: string }> {
    const res = await fetch(`${API_URL}/auth/login-api-key`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey: apiKeyValue }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      throw new Error(parseError(res, data))
    }
    const role = data.role || 'user'
    localStorage.setItem(STORAGE_KEY, data.apiKey ?? apiKeyValue)
    setApiKey(data.apiKey ?? apiKeyValue)
    setUser({ id: data.email, owner: data.email, role })
    return { role }
  }

  async function loginByEmail(email: string): Promise<{ role: string }> {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      throw new Error(parseError(res, data))
    }
    const role = data.role || 'user'
    const key = data.apiKey
    if (key) {
      localStorage.setItem(STORAGE_KEY, key)
      setApiKey(key)
    }
    setUser({ id: data.email, owner: data.email, role })
    return { role }
  }

  async function register(email: string): Promise<{ role: string }> {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      throw new Error(parseError(res, data))
    }
    const role = data.role || 'user'
    const key = data.apiKey
    if (key) {
      localStorage.setItem(STORAGE_KEY, key)
      setApiKey(key)
    }
    setUser({ id: data.email, owner: data.email, role })
    return { role }
  }

  async function logout() {
    localStorage.removeItem(STORAGE_KEY)
    setApiKey(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        apiKey,
        loading,
        loginByApiKey,
        loginByEmail,
        register,
        logout,
        isAuthenticated: !!user && !!apiKey,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
