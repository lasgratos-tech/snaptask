import { useState, FormEvent, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Register() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { register, user, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  // Redirection si déjà authentifié
  useEffect(() => {
    if (!isAuthenticated || !user) return
    if (user.role === 'admin') {
      navigate('/admin', { replace: true })
    } else {
      navigate('/app', { replace: true })
    }
  }, [isAuthenticated, user, navigate])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (!email.trim() || !email.includes('@')) {
        throw new Error('Email invalide.')
      }

      const { role } = await register(email.trim().toLowerCase())

      if (role === 'admin') {
        navigate('/admin', { replace: true })
      } else {
        navigate('/app', { replace: true })
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de l\'inscription'
      const readable = msg === 'Failed to fetch' || msg === 'Load failed'
        ? 'Impossible de joindre le serveur. Vérifiez l\'URL (VITE_API_URL) et que le backend est démarré.'
        : msg
      setError(readable)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 400,
          backgroundColor: '#1e293b',
          border: '1px solid #334155',
          borderRadius: 12,
          padding: 32,
        }}
      >
        <h1 style={{ fontSize: 28, marginBottom: 8, textAlign: 'center' }}>Inscription</h1>
        <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 32, textAlign: 'center' }}>
          Créez votre compte SnapTask
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 24 }}>
            <label
              style={{
                display: 'block',
                fontSize: 13,
                marginBottom: 8,
                color: '#e2e8f0',
              }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="votre@email.com"
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                borderRadius: 6,
                color: 'white',
                fontSize: 14,
              }}
            />
            <p style={{ fontSize: 12, color: '#64748b', marginTop: 8, margin: 0 }}>
              Votre clé API sera générée automatiquement après l'inscription.
            </p>
          </div>

          {error && (
            <div
              style={{
                marginBottom: 24,
                padding: '12px',
                backgroundColor: '#7f1d1d',
                borderRadius: 6,
                color: '#fca5a5',
                fontSize: 13,
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: '#3b82f6',
              border: 'none',
              borderRadius: 6,
              color: 'white',
              fontSize: 16,
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1,
              marginBottom: 16,
            }}
          >
            {loading ? 'Inscription...' : 'S\'inscrire'}
          </button>

          <p style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', margin: 0 }}>
            Déjà un compte ?{' '}
            <Link
              to="/login"
              style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 500 }}
            >
              Se connecter
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
