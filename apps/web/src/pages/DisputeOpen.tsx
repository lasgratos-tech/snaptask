import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
const API_KEY = import.meta.env.VITE_API_KEY

interface TaskExecution {
  id: string
  taskId: string
  status: string
  deliverableUrl?: string
  proofUrl?: string
  validatedAt?: string
  validationDecision?: string
}

export default function DisputeOpen() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [execution, setExecution] = useState<TaskExecution | null>(null)
  const [disputeType, setDisputeType] = useState<'result' | 'proof' | 'validation'>('result')
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) {
      navigate('/dashboard')
      return
    }
    loadExecution()
  }, [id])

  async function loadExecution() {
    try {
      const res = await fetch(`${API_BASE_URL}/v4/admin/tasks/${id}`, {
        headers: { 'x-api-key': API_KEY || '' },
      })
      if (res.ok) {
        const data = await res.json()
        setExecution(data)
        if (data.status !== 'COMPLETED' && data.status !== 'REJECTED') {
          setError('Un litige ne peut être ouvert que pour une tâche terminée ou rejetée')
        }
      } else {
        setError('Exécution non trouvée')
      }
    } catch (err) {
      console.error('Erreur chargement exécution:', err)
      setError('Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!reason.trim() || !id) return

    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch(`${API_BASE_URL}/v4/disputes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY || '',
        },
        body: JSON.stringify({
          taskExecutionId: id,
          type: disputeType,
          reason: reason.trim(),
        }),
      })

      if (res.ok) {
        const data = await res.json()
        navigate(`/disputes/${data.id}`)
      } else {
        const data = await res.json()
        setError(data.error || 'Erreur lors de l\'ouverture du litige')
      }
    } catch (err) {
      console.error('Erreur ouverture litige:', err)
      setError('Erreur lors de l\'ouverture du litige')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0a0e27',
          color: 'white',
        }}
      >
        <p>Chargement...</p>
      </div>
    )
  }

  if (error && !execution) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0a0e27',
          color: 'white',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: 24, marginBottom: 16 }}>Erreur</h1>
          <p style={{ color: '#94a3b8', marginBottom: 16 }}>{error}</p>
          <Link to="/dashboard" style={{ color: '#60a5fa', textDecoration: 'none' }}>
            Retour au dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0a0e27',
        color: 'white',
        padding: '48px 24px',
      }}
    >
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 32, margin: 0, marginBottom: 8 }}>Ouvrir un litige</h1>
          <p style={{ fontSize: 16, color: '#94a3b8', margin: 0 }}>
            Exécution #{execution?.id}
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: '#7f1d1d',
              border: '1px solid #991b1b',
              borderRadius: 6,
              marginBottom: 24,
              color: '#fca5a5',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 24 }}>
            <label
              style={{
                display: 'block',
                fontSize: 14,
                fontWeight: 600,
                marginBottom: 8,
                color: '#e2e8f0',
              }}
            >
              Type de litige
            </label>
            <select
              value={disputeType}
              onChange={(e) => setDisputeType(e.target.value as any)}
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: 6,
                color: 'white',
                fontSize: 14,
              }}
            >
              <option value="result">Résultat non conforme</option>
              <option value="proof">Preuve d'exécution</option>
              <option value="validation">Validation incorrecte</option>
            </select>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label
              style={{
                display: 'block',
                fontSize: 14,
                fontWeight: 600,
                marginBottom: 8,
                color: '#e2e8f0',
              }}
            >
              Raison du litige *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Décrivez brièvement la raison de votre litige..."
              required
              rows={6}
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: 6,
                color: 'white',
                fontSize: 14,
                fontFamily: 'inherit',
                resize: 'vertical',
              }}
            />
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
              Maximum 500 caractères
            </div>
          </div>

          <div style={{ display: 'flex', gap: 16 }}>
            <button
              type="submit"
              disabled={submitting || !reason.trim() || (execution && execution.status !== 'COMPLETED' && execution.status !== 'REJECTED')}
              style={{
                padding: '12px 24px',
                backgroundColor: submitting ? '#475569' : '#2563eb',
                border: 'none',
                borderRadius: 6,
                color: 'white',
                fontSize: 14,
                fontWeight: 600,
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting || !reason.trim() ? 0.6 : 1,
              }}
            >
              {submitting ? 'Ouverture...' : 'Ouvrir le litige'}
            </button>
            <Link
              to="/dashboard"
              style={{
                padding: '12px 24px',
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: 6,
                color: 'white',
                textDecoration: 'none',
                fontSize: 14,
                display: 'inline-block',
              }}
            >
              Annuler
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
