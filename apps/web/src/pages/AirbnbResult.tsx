import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
const API_KEY = import.meta.env.VITE_API_KEY || ''

interface TaskExecution {
  id: string
  taskId: string
  status: string
  deliverableUrl?: string
  proofUrl?: string
  createdAt: string
}

export default function AirbnbResult() {
  const { executionId } = useParams<{ executionId: string }>()
  const [execution, setExecution] = useState<TaskExecution | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (executionId) {
      loadExecution()
    }
  }, [executionId])

  async function loadExecution() {
    try {
      const res = await fetch(`${API_BASE_URL}/v4/user/executions/${executionId}`, {
        headers: { 'x-api-key': API_KEY },
      })
      if (res.ok) {
        const data = await res.json()
        setExecution(data.execution)
      }
    } catch (error) {
      console.error('Erreur chargement exécution:', error)
    } finally {
      setLoading(false)
    }
  }

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

  if (!execution) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#0f172a',
          color: 'white',
          padding: '24px',
          textAlign: 'center',
        }}
      >
        <h1 style={{ fontSize: 24, marginBottom: 16 }}>Exécution introuvable</h1>
        <Link
          to="/my-tasks"
          style={{
            display: 'inline-block',
            padding: '12px 24px',
            backgroundColor: '#3b82f6',
            borderRadius: 8,
            color: 'white',
            textDecoration: 'none',
          }}
        >
          Retour à mes tâches
        </Link>
      </div>
    )
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        color: 'white',
        padding: '24px 16px',
      }}
    >
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <h1 style={{ fontSize: 28, marginBottom: 8, textAlign: 'center' }}>
          Photo capturée
        </h1>
        <p style={{ fontSize: 16, color: '#94a3b8', marginBottom: 32, textAlign: 'center' }}>
          Votre photo horodatée a été enregistrée
        </p>

        {execution.proofUrl && (
          <div
            style={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: 12,
              padding: 24,
              marginBottom: 24,
            }}
          >
            <h2 style={{ fontSize: 18, marginBottom: 16 }}>Preuve d'exécution</h2>
            <div
              style={{
                width: '100%',
                borderRadius: 8,
                overflow: 'hidden',
                marginBottom: 16,
              }}
            >
              <img
                src={`${API_BASE_URL}${execution.proofUrl}`}
                alt="Photo capturée"
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                }}
              />
            </div>
            <a
              href={`${API_BASE_URL}${execution.proofUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block',
                padding: '12px',
                backgroundColor: '#3b82f6',
                borderRadius: 8,
                color: 'white',
                textDecoration: 'none',
                textAlign: 'center',
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              Voir la photo complète
            </a>
          </div>
        )}

        {execution.deliverableUrl && (
          <div
            style={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: 12,
              padding: 24,
              marginBottom: 24,
            }}
          >
            <h2 style={{ fontSize: 18, marginBottom: 16 }}>Document final</h2>
            <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 16 }}>
              Votre document PDF avec photo horodatée est prêt
            </p>
            <a
              href={`${API_BASE_URL}${execution.deliverableUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block',
                padding: '16px',
                backgroundColor: '#10b981',
                borderRadius: 8,
                color: 'white',
                textDecoration: 'none',
                textAlign: 'center',
                fontSize: 16,
                fontWeight: 600,
              }}
            >
              Télécharger le PDF
            </a>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Link
            to="/my-tasks"
            style={{
              display: 'block',
              padding: '16px',
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: 8,
              color: 'white',
              textDecoration: 'none',
              textAlign: 'center',
              fontSize: 16,
              fontWeight: 500,
            }}
          >
            Voir mes tâches
          </Link>
          <Link
            to="/catalogue"
            style={{
              display: 'block',
              padding: '16px',
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: 8,
              color: 'white',
              textDecoration: 'none',
              textAlign: 'center',
              fontSize: 16,
              fontWeight: 500,
            }}
          >
            Retour au catalogue
          </Link>
        </div>
      </div>
    </div>
  )
}
