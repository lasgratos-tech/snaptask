import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useUserRole } from '../hooks/useUserRole'
import { canAccessAdminPanel } from '../models/user'

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
  createdAt: string
  updatedAt: string
}

export default function AdminProofs() {
  const userRole = useUserRole()
  const [executions, setExecutions] = useState<TaskExecution[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'with_proof' | 'without_proof'>('all')

  useEffect(() => {
    if (userRole && canAccessAdminPanel(userRole)) {
      loadExecutions()
    }
  }, [userRole])

  async function loadExecutions() {
    try {
      const res = await fetch(`${API_BASE_URL}/v4/admin/executions`, {
        headers: { 'x-api-key': API_KEY },
      })
      if (res.ok) {
        const data = await res.json()
        setExecutions(data.executions || [])
      }
    } catch (error) {
      console.error('Erreur chargement preuves:', error)
    } finally {
      setLoading(false)
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

  const filteredExecutions = executions.filter((exec) => {
    if (filter === 'with_proof') return !!exec.proofUrl
    if (filter === 'without_proof') return !exec.proofUrl
    return true
  })

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
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h1 style={{ fontSize: 32, margin: 0, marginBottom: 8 }}>Preuves d'exécution</h1>
              <p style={{ fontSize: 16, color: '#94a3b8', margin: 0 }}>
                Consultation des preuves d'exécution des tâches
              </p>
            </div>
            <Link
              to="/admin"
              style={{
                padding: '8px 16px',
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: 6,
                color: 'white',
                textDecoration: 'none',
                fontSize: 14,
              }}
            >
              Retour Admin
            </Link>
          </div>

          {/* Filtres */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
            <button
              onClick={() => setFilter('all')}
              style={{
                padding: '8px 16px',
                backgroundColor: filter === 'all' ? '#3b82f6' : '#1e293b',
                border: '1px solid #334155',
                borderRadius: 6,
                color: 'white',
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              Toutes
            </button>
            <button
              onClick={() => setFilter('with_proof')}
              style={{
                padding: '8px 16px',
                backgroundColor: filter === 'with_proof' ? '#3b82f6' : '#1e293b',
                border: '1px solid #334155',
                borderRadius: 6,
                color: 'white',
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              Avec preuve
            </button>
            <button
              onClick={() => setFilter('without_proof')}
              style={{
                padding: '8px 16px',
                backgroundColor: filter === 'without_proof' ? '#3b82f6' : '#1e293b',
                border: '1px solid #334155',
                borderRadius: 6,
                color: 'white',
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              Sans preuve
            </button>
          </div>
        </div>

        {filteredExecutions.length === 0 ? (
          <div
            style={{
              padding: 48,
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: 12,
              textAlign: 'center',
            }}
          >
            <p style={{ fontSize: 16, color: '#94a3b8' }}>Aucune exécution trouvée</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {filteredExecutions.map((execution) => (
              <div
                key={execution.id}
                style={{
                  padding: 20,
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: 8,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div>
                    <h3 style={{ fontSize: 18, margin: 0, marginBottom: 4 }}>{execution.taskId}</h3>
                    <div style={{ fontSize: 14, color: '#94a3b8' }}>
                      Exécution {execution.id} • {getStatusLabel(execution.status)}
                    </div>
                    <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
                      Créée le {new Date(execution.createdAt).toLocaleString('fr-FR')}
                    </div>
                  </div>
                  <Link
                    to={`/admin/executions/${execution.id}`}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#3b82f6',
                      borderRadius: 6,
                      color: 'white',
                      textDecoration: 'none',
                      fontSize: 14,
                    }}
                  >
                    Voir détail
                  </Link>
                </div>

                {execution.proofUrl ? (
                  <div
                    style={{
                      padding: 16,
                      backgroundColor: '#0f172a',
                      borderRadius: 8,
                      marginTop: 12,
                    }}
                  >
                    <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 8, textTransform: 'uppercase' }}>
                      Preuve d'exécution
                    </div>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <a
                        href={`${API_BASE_URL}${execution.proofUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          padding: '8px 16px',
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
                        <span style={{ fontSize: 13, color: '#94a3b8' }}>
                          Uploadée le {new Date(execution.proofUploadedAt).toLocaleString('fr-FR')}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      padding: 16,
                      backgroundColor: '#0f172a',
                      borderRadius: 8,
                      marginTop: 12,
                      fontSize: 14,
                      color: '#94a3b8',
                    }}
                  >
                    Aucune preuve disponible
                  </div>
                )}

                {execution.deliverableUrl && (
                  <div
                    style={{
                      padding: 16,
                      backgroundColor: '#0f172a',
                      borderRadius: 8,
                      marginTop: 12,
                    }}
                  >
                    <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 8, textTransform: 'uppercase' }}>
                      Livrable
                    </div>
                    <a
                      href={`${API_BASE_URL}${execution.deliverableUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: '8px 16px',
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
