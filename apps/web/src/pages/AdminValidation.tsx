import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  TaskExecution,
  TaskExecutionStatus,
  ValidationDecision,
} from '../models/proof'
import { getTaskById } from '../models/task'
import { useUserRole } from '../hooks/useUserRole'
import { canValidate } from '../models/user'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
const API_KEY = import.meta.env.VITE_API_KEY

export default function AdminValidation() {
  const userRole = useUserRole()
  const [executions, setExecutions] = useState<TaskExecution[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedExecution, setSelectedExecution] = useState<TaskExecution | null>(null)
  const [validationComment, setValidationComment] = useState('')
  const [rejectReason, setRejectReason] = useState('')
  const [rejectComment, setRejectComment] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    loadExecutions()
  }, [])

  async function loadExecutions() {
    try {
      const res = await fetch(`${API_BASE_URL}/v4/admin/tasks/waiting-validation`, {
        headers: {
          'x-api-key': API_KEY || '',
        },
      })
      const data = await res.json()
      if (res.ok) {
        setExecutions(data.executions || [])
      }
    } catch (error) {
      console.error('Erreur chargement exécutions:', error)
    } finally {
      setLoading(false)
    }
  }

  async function loadExecutionDetail(id: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/v4/admin/tasks/${id}`, {
        headers: {
          'x-api-key': API_KEY || '',
        },
      })
      const data = await res.json()
      if (res.ok) {
        setSelectedExecution(data)
      }
    } catch (error) {
      console.error('Erreur chargement détail:', error)
    }
  }

  async function handleValidate(id: string) {
    setProcessing(true)
    try {
      const res = await fetch(`${API_BASE_URL}/v4/admin/tasks/${id}/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY || '',
        },
        body: JSON.stringify({
          comment: validationComment.trim() || undefined,
        }),
      })
      if (res.ok) {
        await loadExecutions()
        setSelectedExecution(null)
        setValidationComment('')
      } else {
        const data = await res.json()
        alert(`Erreur: ${data.error || 'Validation échouée'}`)
      }
    } catch (error) {
      console.error('Erreur validation:', error)
      alert('Erreur lors de la validation')
    } finally {
      setProcessing(false)
    }
  }

  async function handleReject(id: string) {
    if (!rejectReason.trim()) {
      alert('Raison du rejet requise')
      return
    }
    setProcessing(true)
    try {
      const res = await fetch(`${API_BASE_URL}/v4/admin/tasks/${id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY || '',
        },
        body: JSON.stringify({
          reason: rejectReason.trim(),
          comment: rejectComment.trim() || undefined,
        }),
      })
      if (res.ok) {
        await loadExecutions()
        setSelectedExecution(null)
        setRejectReason('')
        setRejectComment('')
      } else {
        const data = await res.json()
        alert(`Erreur: ${data.error || 'Rejet échoué'}`)
      }
    } catch (error) {
      console.error('Erreur rejet:', error)
      alert('Erreur lors du rejet')
    } finally {
      setProcessing(false)
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
          backgroundColor: '#0f172a',
          color: 'white',
        }}
      >
        <p>Chargement...</p>
      </div>
    )
  }

  if (userRole && !canValidate(userRole)) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0f172a',
          color: 'white',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: 24, marginBottom: 16 }}>Accès refusé</h1>
          <p style={{ color: '#94a3b8' }}>
            Cette page nécessite le rôle reviewer ou admin.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        color: 'white',
        padding: '48px 24px',
      }}
    >
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <div style={{ marginBottom: 48 }}>
          <Link
            to="/admin"
            style={{
              display: 'inline-block',
              color: '#94a3b8',
              textDecoration: 'none',
              marginBottom: 16,
              fontSize: 14,
            }}
          >
            ← Retour admin
          </Link>
          <h1 style={{ fontSize: 32, margin: 0, marginBottom: 8 }}>
            Validation humaine
          </h1>
          <p style={{ fontSize: 16, color: '#94a3b8', margin: 0 }}>
            Tâches en attente de validation ({executions.length})
          </p>
        </div>

        {executions.length === 0 ? (
          <div
            style={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: 8,
              padding: 48,
              textAlign: 'center',
            }}
          >
            <p style={{ fontSize: 16, color: '#94a3b8' }}>
              Aucune tâche en attente de validation
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24 }}>
            <div>
              <div
                style={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: 8,
                  overflow: 'hidden',
                }}
              >
                {executions.map((exec, index) => {
                  const task = getTaskById(exec.taskId)
                  const isSelected = selectedExecution?.id === exec.id
                  return (
                    <div
                      key={exec.id}
                      onClick={() => loadExecutionDetail(exec.id)}
                      style={{
                        padding: 16,
                        borderBottom:
                          index < executions.length - 1 ? '1px solid #334155' : 'none',
                        cursor: 'pointer',
                        backgroundColor: isSelected ? '#334155' : 'transparent',
                        transition: 'background-color 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = '#293548'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = 'transparent'
                        }
                      }}
                    >
                      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                        {task?.name || exec.taskId}
                      </div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>
                        {exec.userId} • {new Date(exec.createdAt).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {selectedExecution && (
              <div
                style={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: 8,
                  padding: 32,
                }}
              >
                <div style={{ marginBottom: 24 }}>
                  <h2 style={{ fontSize: 20, margin: 0, marginBottom: 8 }}>
                    {getTaskById(selectedExecution.taskId)?.name || selectedExecution.taskId}
                  </h2>
                  <div style={{ fontSize: 13, color: '#94a3b8' }}>
                    Exécution {selectedExecution.id} • Utilisateur {selectedExecution.userId}
                  </div>
                </div>

                {selectedExecution.deliverableUrl && (
                  <div style={{ marginBottom: 24 }}>
                    <h3 style={{ fontSize: 14, marginBottom: 12, color: '#e2e8f0' }}>
                      Livrable généré
                    </h3>
                    <div
                      style={{
                        padding: 16,
                        backgroundColor: '#0f172a',
                        borderRadius: 6,
                        border: '1px solid #334155',
                      }}
                    >
                      <a
                        href={selectedExecution.deliverableUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: '#60a5fa',
                          textDecoration: 'none',
                          fontSize: 13,
                        }}
                      >
                        {selectedExecution.deliverableUrl}
                      </a>
                    </div>
                  </div>
                )}

                {selectedExecution.proofUrl && (
                  <div style={{ marginBottom: 24 }}>
                    <h3 style={{ fontSize: 14, marginBottom: 12, color: '#e2e8f0' }}>
                      Preuve fournie
                    </h3>
                    <div
                      style={{
                        padding: 16,
                        backgroundColor: '#0f172a',
                        borderRadius: 6,
                        border: '1px solid #334155',
                      }}
                    >
                      <a
                        href={selectedExecution.proofUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: '#60a5fa',
                          textDecoration: 'none',
                          fontSize: 13,
                        }}
                      >
                        {selectedExecution.proofUrl}
                      </a>
                    </div>
                  </div>
                )}

                <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: 13,
                        marginBottom: 8,
                        color: '#e2e8f0',
                      }}
                    >
                      Commentaire de validation (optionnel)
                    </label>
                    <textarea
                      value={validationComment}
                      onChange={(e) => setValidationComment(e.target.value)}
                      placeholder="Commentaire interne..."
                      style={{
                        width: '100%',
                        minHeight: 80,
                        padding: 12,
                        backgroundColor: '#0f172a',
                        border: '1px solid #334155',
                        borderRadius: 6,
                        color: 'white',
                        fontSize: 13,
                        fontFamily: 'inherit',
                      }}
                    />
                    <button
                      onClick={() => handleValidate(selectedExecution.id)}
                      disabled={processing}
                      style={{
                        marginTop: 12,
                        width: '100%',
                        padding: '12px 24px',
                        backgroundColor: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: 6,
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: processing ? 'not-allowed' : 'pointer',
                        opacity: processing ? 0.6 : 1,
                      }}
                    >
                      Valider
                    </button>
                  </div>

                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: 13,
                        marginBottom: 8,
                        color: '#e2e8f0',
                      }}
                    >
                      Raison du rejet *
                    </label>
                    <input
                      type="text"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Raison du rejet..."
                      style={{
                        width: '100%',
                        padding: 12,
                        backgroundColor: '#0f172a',
                        border: '1px solid #334155',
                        borderRadius: 6,
                        color: 'white',
                        fontSize: 13,
                        fontFamily: 'inherit',
                        marginBottom: 12,
                      }}
                    />
                    <label
                      style={{
                        display: 'block',
                        fontSize: 13,
                        marginBottom: 8,
                        color: '#e2e8f0',
                      }}
                    >
                      Commentaire (optionnel)
                    </label>
                    <textarea
                      value={rejectComment}
                      onChange={(e) => setRejectComment(e.target.value)}
                      placeholder="Commentaire interne..."
                      style={{
                        width: '100%',
                        minHeight: 80,
                        padding: 12,
                        backgroundColor: '#0f172a',
                        border: '1px solid #334155',
                        borderRadius: 6,
                        color: 'white',
                        fontSize: 13,
                        fontFamily: 'inherit',
                      }}
                    />
                    <button
                      onClick={() => handleReject(selectedExecution.id)}
                      disabled={processing || !rejectReason.trim()}
                      style={{
                        marginTop: 12,
                        width: '100%',
                        padding: '12px 24px',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: 6,
                        fontSize: 14,
                        fontWeight: 600,
                        cursor:
                          processing || !rejectReason.trim() ? 'not-allowed' : 'pointer',
                        opacity: processing || !rejectReason.trim() ? 0.6 : 1,
                      }}
                    >
                      Rejeter
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
