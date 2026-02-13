import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useUserRole } from '../hooks/useUserRole'
import { canAccessAdminPanel, canValidate } from '../models/user'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
const API_KEY = import.meta.env.VITE_API_KEY || ''

interface TaskExecution {
  id: string
  taskId: string
  userId: string
  status: string
  proofUrl?: string
  proofUploadedAt?: string
  deliverableUrl?: string
  validatedAt?: string
  validatedBy?: string
  validationDecision?: 'approved' | 'rejected' | null
  validationComment?: string
  rejectedReason?: string
  createdAt: string
  updatedAt: string
}

export default function AdminExecutionDetail() {
  const { id } = useParams<{ id: string }>()
  const userRole = useUserRole()
  const [execution, setExecution] = useState<TaskExecution | null>(null)
  const [loading, setLoading] = useState(true)
  const [validationReason, setValidationReason] = useState('')
  const [validationComment, setValidationComment] = useState('')
  const [validating, setValidating] = useState(false)
  const [rejecting, setRejecting] = useState(false)

  useEffect(() => {
    if (id && userRole && canAccessAdminPanel(userRole)) {
      loadExecution(id)
    }
  }, [id, userRole])

  async function loadExecution(executionId: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/v4/admin/tasks/${executionId}`, {
        headers: { 'x-api-key': API_KEY },
      })
      if (res.ok) {
        const data = await res.json()
        setExecution(data)
      }
    } catch (error) {
      console.error('Erreur chargement exécution:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleValidate() {
    if (!id || !validationComment.trim()) return

    setValidating(true)
    try {
      const res = await fetch(`${API_BASE_URL}/v4/admin/tasks/${id}/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
        },
        body: JSON.stringify({ comment: validationComment.trim() }),
      })

      if (res.ok) {
        await loadExecution(id)
        setValidationComment('')
      }
    } catch (error) {
      console.error('Erreur validation:', error)
    } finally {
      setValidating(false)
    }
  }

  async function handleReject() {
    if (!id || !validationReason.trim()) return

    setRejecting(true)
    try {
      const res = await fetch(`${API_BASE_URL}/v4/admin/tasks/${id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
        },
        body: JSON.stringify({
          reason: validationReason.trim(),
          comment: validationComment.trim() || undefined,
        }),
      })

      if (res.ok) {
        await loadExecution(id)
        setValidationReason('')
        setValidationComment('')
      }
    } catch (error) {
      console.error('Erreur rejet:', error)
    } finally {
      setRejecting(false)
    }
  }

  function getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      PENDING: 'En attente',
      PROCESSING: 'En cours',
      WAITING_PROOF: 'Preuve requise',
      WAITING_VALIDATION: 'En validation',
      COMPLETED: 'Terminée',
      REJECTED: 'Rejetée',
    }
    return labels[status] || status
  }

  function getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      PENDING: '#64748b',
      PROCESSING: '#3b82f6',
      WAITING_PROOF: '#f59e0b',
      WAITING_VALIDATION: '#8b5cf6',
      COMPLETED: '#10b981',
      REJECTED: '#ef4444',
    }
    return colors[status] || '#64748b'
  }

  if (userRole && !canAccessAdminPanel(userRole)) {
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
          <p style={{ color: '#94a3b8' }}>Cette page nécessite le rôle admin.</p>
        </div>
      </div>
    )
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
          padding: '48px 24px',
        }}
      >
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ fontSize: 24, marginBottom: 16 }}>Exécution introuvable</h1>
          <Link
            to="/admin/executions"
            style={{
              display: 'inline-block',
              padding: '10px 20px',
              backgroundColor: '#3b82f6',
              borderRadius: 6,
              color: 'white',
              textDecoration: 'none',
            }}
          >
            Retour aux exécutions
          </Link>
        </div>
      </div>
    )
  }

  const canValidateExecution = userRole && canValidate(userRole) && execution.status === 'WAITING_VALIDATION'

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        color: 'white',
        padding: '48px 24px',
      }}
    >
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ marginBottom: 32 }}>
          <Link
            to="/admin/executions"
            style={{
              display: 'inline-block',
              marginBottom: 16,
              color: '#94a3b8',
              textDecoration: 'none',
              fontSize: 14,
            }}
          >
            ← Retour aux exécutions
          </Link>
          <h1 style={{ fontSize: 32, margin: 0, marginBottom: 8 }}>Détail de l'exécution</h1>
          <p style={{ fontSize: 16, color: '#94a3b8', margin: 0 }}>
            {execution.taskId} • {execution.id}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Statut */}
          <div
            style={{
              padding: 20,
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: 8,
            }}
          >
            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 8, textTransform: 'uppercase' }}>
              Statut
            </div>
            <div
              style={{
                display: 'inline-block',
                padding: '8px 16px',
                backgroundColor: '#0f172a',
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 500,
                color: getStatusColor(execution.status),
              }}
            >
              {getStatusLabel(execution.status)}
            </div>
          </div>

          {/* Informations */}
          <div
            style={{
              padding: 20,
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: 8,
            }}
          >
            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 12, textTransform: 'uppercase' }}>
              Informations
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div>
                <span style={{ fontSize: 14, color: '#94a3b8' }}>Utilisateur :</span>{' '}
                <span style={{ fontSize: 14 }}>{execution.userId}</span>
              </div>
              <div>
                <span style={{ fontSize: 14, color: '#94a3b8' }}>Créée le :</span>{' '}
                <span style={{ fontSize: 14 }}>{new Date(execution.createdAt).toLocaleString('fr-FR')}</span>
              </div>
              <div>
                <span style={{ fontSize: 14, color: '#94a3b8' }}>Dernière mise à jour :</span>{' '}
                <span style={{ fontSize: 14 }}>{new Date(execution.updatedAt).toLocaleString('fr-FR')}</span>
              </div>
            </div>
          </div>

          {/* Livrable */}
          {execution.deliverableUrl && (
            <div
              style={{
                padding: 20,
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: 8,
              }}
            >
              <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 12, textTransform: 'uppercase' }}>
                Livrable
              </div>
              <a
                href={`${API_BASE_URL}${execution.deliverableUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block',
                  padding: '10px 20px',
                  backgroundColor: '#3b82f6',
                  borderRadius: 6,
                  color: 'white',
                  textDecoration: 'none',
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                Télécharger le livrable
              </a>
            </div>
          )}

          {/* Preuve */}
          {execution.proofUrl && (
            <div
              style={{
                padding: 20,
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: 8,
              }}
            >
              <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 12, textTransform: 'uppercase' }}>
                Preuve d'exécution
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <a
                  href={`${API_BASE_URL}${execution.proofUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-block',
                    padding: '10px 20px',
                    backgroundColor: '#10b981',
                    borderRadius: 6,
                    color: 'white',
                    textDecoration: 'none',
                    fontSize: 14,
                    fontWeight: 500,
                  }}
                >
                  Voir la preuve
                </a>
                {execution.proofUploadedAt && (
                  <div style={{ fontSize: 13, color: '#94a3b8' }}>
                    Uploadée le {new Date(execution.proofUploadedAt).toLocaleString('fr-FR')}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Validation */}
          {canValidateExecution && (
            <div
              style={{
                padding: 20,
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: 8,
              }}
            >
              <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 12, textTransform: 'uppercase' }}>
                Validation
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <textarea
                  value={validationComment}
                  onChange={(e) => setValidationComment(e.target.value)}
                  placeholder="Commentaire (optionnel)"
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: 6,
                    color: 'white',
                    fontSize: 14,
                    fontFamily: 'inherit',
                  }}
                />
                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    onClick={handleValidate}
                    disabled={validating}
                    style={{
                      flex: 1,
                      padding: '10px 20px',
                      backgroundColor: '#10b981',
                      border: 'none',
                      borderRadius: 6,
                      color: 'white',
                      fontSize: 14,
                      fontWeight: 500,
                      cursor: validating ? 'not-allowed' : 'pointer',
                      opacity: validating ? 0.5 : 1,
                    }}
                  >
                    {validating ? 'Validation...' : 'Valider'}
                  </button>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <input
                      type="text"
                      value={validationReason}
                      onChange={(e) => setValidationReason(e.target.value)}
                      placeholder="Raison du rejet (requis)"
                      style={{
                        width: '100%',
                        padding: '12px',
                        backgroundColor: '#0f172a',
                        border: '1px solid #334155',
                        borderRadius: 6,
                        color: 'white',
                        fontSize: 14,
                        fontFamily: 'inherit',
                      }}
                    />
                    <button
                      onClick={handleReject}
                      disabled={rejecting || !validationReason.trim()}
                      style={{
                        flex: 1,
                        padding: '10px 20px',
                        backgroundColor: '#ef4444',
                        border: 'none',
                        borderRadius: 6,
                        color: 'white',
                        fontSize: 14,
                        fontWeight: 500,
                        cursor: rejecting || !validationReason.trim() ? 'not-allowed' : 'pointer',
                        opacity: rejecting || !validationReason.trim() ? 0.5 : 1,
                      }}
                    >
                      {rejecting ? 'Rejet...' : 'Rejeter'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Validation existante */}
          {execution.validatedAt && (
            <div
              style={{
                padding: 20,
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: 8,
              }}
            >
              <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 12, textTransform: 'uppercase' }}>
                Validation
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div>
                  <span style={{ fontSize: 14, color: '#94a3b8' }}>Décision :</span>{' '}
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: execution.validationDecision === 'approved' ? '#10b981' : '#ef4444',
                    }}
                  >
                    {execution.validationDecision === 'approved' ? 'Approuvée' : 'Rejetée'}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: 14, color: '#94a3b8' }}>Par :</span>{' '}
                  <span style={{ fontSize: 14 }}>{execution.validatedBy || 'N/A'}</span>
                </div>
                <div>
                  <span style={{ fontSize: 14, color: '#94a3b8' }}>Le :</span>{' '}
                  <span style={{ fontSize: 14 }}>{new Date(execution.validatedAt).toLocaleString('fr-FR')}</span>
                </div>
                {execution.validationComment && (
                  <div>
                    <span style={{ fontSize: 14, color: '#94a3b8' }}>Commentaire :</span>{' '}
                    <span style={{ fontSize: 14 }}>{execution.validationComment}</span>
                  </div>
                )}
                {execution.rejectedReason && (
                  <div>
                    <span style={{ fontSize: 14, color: '#94a3b8' }}>Raison :</span>{' '}
                    <span style={{ fontSize: 14, color: '#ef4444' }}>{execution.rejectedReason}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Audit logs */}
          <div
            style={{
              padding: 20,
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: 8,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: '#94a3b8', textTransform: 'uppercase' }}>
                Audit logs
              </div>
              <Link
                to={`/admin/audit/${execution.id}`}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#3b82f6',
                  borderRadius: 6,
                  color: 'white',
                  textDecoration: 'none',
                  fontSize: 13,
                }}
              >
                Voir tous les logs
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
