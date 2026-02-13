import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const API_KEY = import.meta.env.VITE_API_KEY as string | undefined

export default function CvPage() {
  const navigate = useNavigate()
  const [profileText, setProfileText] = useState('')
  const [targetRole, setTargetRole] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!API_KEY) {
        throw new Error('VITE_API_KEY manquant dans la configuration frontend')
      }

      const trimmedProfile = profileText.trim()
      const trimmedRole = targetRole.trim()

      if (!trimmedProfile || !trimmedRole) {
        throw new Error('Profil et rôle cible sont requis')
      }

      const res = await fetch(`${API_URL}/v4/cv/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
        },
        body: JSON.stringify({
          profileText: trimmedProfile,
          targetRole: trimmedRole,
          language: 'fr',
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        const message = data?.message ?? data?.error ?? 'Erreur API'
        throw new Error(message)
      }

      // Stocker le résultat brut pour la page de résultat
      sessionStorage.setItem('cvResult', JSON.stringify(data))

      // Redirection vers /cv/processing
      navigate('/cv/processing')
    } catch (err: any) {
      setError(err.message ?? 'Erreur lors de la génération du CV')
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0b1020',
        padding: 24,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 960,
          background:
            'radial-gradient(circle at top left, #1f2937 0, #020617 50%, #020617 100%)',
          borderRadius: 16,
          border: '1px solid rgba(148, 163, 184, 0.3)',
          boxShadow:
            '0 20px 40px rgba(15, 23, 42, 0.8), 0 0 0 1px rgba(15, 23, 42, 0.9)',
          padding: 24,
          color: 'white',
        }}
      >
        <div
          style={{
            marginBottom: 24,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 24,
                margin: 0,
              }}
            >
              CV professionnel
            </h1>
            <p
              style={{
                margin: '8px 0 0',
                fontSize: 14,
                color: '#9ca3af',
              }}
            >
              Décrivez votre profil et précisez le rôle cible. Nous générons un CV
              complet.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                display: 'block',
                marginBottom: 8,
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              Profil (texte libre)
            </label>
            <textarea
              value={profileText}
              onChange={(e) => setProfileText(e.target.value)}
              placeholder="Parlez de votre expérience, de vos missions clés, de vos compétences, de votre contexte actuel..."
              style={{
                width: '100%',
                minHeight: 200,
                padding: 12,
                borderRadius: 8,
                border: '1px solid #374151',
                backgroundColor: '#020617',
                color: 'white',
                fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
                fontSize: 14,
                resize: 'vertical',
              }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                display: 'block',
                marginBottom: 8,
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              Rôle cible
            </label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="Ex : Senior Product Manager"
              required
              style={{
                width: '100%',
                padding: 12,
                borderRadius: 8,
                border: '1px solid #374151',
                backgroundColor: '#020617',
                color: 'white',
                fontSize: 14,
              }}
            />
          </div>

          {error && (
            <div
              style={{
                marginBottom: 16,
                padding: 12,
                borderRadius: 8,
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                color: '#fca5a5',
                fontSize: 13,
              }}
            >
              {error}
            </div>
          )}

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginTop: 24,
            }}
          >
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '12px 24px',
                backgroundImage:
                  'linear-gradient(90deg, #6366f1 0%, #ec4899 50%, #f97316 100%)',
                backgroundSize: '200% 100%',
                color: 'white',
                border: 'none',
                borderRadius: 999,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                fontSize: 14,
                fontWeight: 500,
                transition: 'background-position 0.3s ease',
              }}
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLButtonElement).style.backgroundPosition =
                  '-50% 0'
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLButtonElement).style.backgroundPosition =
                  '0 0'
              }}
            >
              {loading ? 'Génération en cours...' : 'Générer mon CV'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
