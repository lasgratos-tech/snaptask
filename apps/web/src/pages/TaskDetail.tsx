import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'

import { useApiKey } from '../hooks/useApiKey'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

interface TaskExecution {
  id: string
  taskId: string
  status: 'PENDING' | 'PROCESSING' | 'WAITING_PROOF' | 'WAITING_VALIDATION' | 'COMPLETED' | 'REJECTED'
  deliverableUrl?: string
  proofUrl?: string
  validatedAt?: string
  validationDecision?: 'approved' | 'rejected' | null
  rejectedReason?: string
  createdAt: string
  updatedAt: string
}

export default function TaskDetail() {
  const { id } = useParams<{ id: string }>()
  const apiKey = useApiKey()
  const navigate = useNavigate()
  const [execution, setExecution] = useState<TaskExecution | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      loadExecution(id)
    }
  }, [id])

  async function loadExecution(executionId: string) {
    try {
      if (!apiKey) {
        navigate('/login')
        return
      }

      const res = await fetch(`${API_BASE_URL}/v4/user/executions/${executionId}`, {
        headers: { 'x-api-key': apiKey },
      })
      if (res.ok) {
        const data = await res.json()
        setExecution(data.execution)
      }
    } catch (error) {
      console.error('Erreur chargement tâche:', error)
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
          <h1 style={{ fontSize: 24, marginBottom: 16 }}>Tâche introuvable</h1>
          <Link
            to="/my-tasks"
            style={{
              display: 'inline-block',
              padding: '10px 20px',
              backgroundColor: '#3b82f6',
              borderRadius: 6,
              color: 'white',
              textDecoration: 'none',
            }}
          >
            Retour à mes tâches
          </Link>
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
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <Link
                to="/my-tasks"
                style={{
                  display: 'inline-block',
                  marginBottom: 12,
                  color: '#94a3b8',
                  textDecoration: 'none',
                  fontSize: 14,
                }}
              >
                ← Retour à mes tâches
              </Link>
              <h1 style={{ fontSize: 32, margin: 0, marginBottom: 8 }}>Détail de la tâche</h1>
              <p style={{ fontSize: 16, color: '#94a3b8', margin: 0 }}>
                {execution.taskId}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <Link
                to="/catalogue"
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
                Catalogue
              </Link>
              <Link
                to="/profile"
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
                Profil
              </Link>
            </div>
          </div>
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

          {/* Dates */}
          <div
            style={{
              padding: 20,
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: 8,
            }}
          >
            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 12, textTransform: 'uppercase' }}>
              Dates
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
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
            </div>
          )}

          {/* Rejet */}
          {execution.status === 'REJECTED' && execution.rejectedReason && (
            <div
              style={{
                padding: 20,
                backgroundColor: '#1e293b',
                border: '1px solid #ef4444',
                borderRadius: 8,
              }}
            >
              <div style={{ fontSize: 12, color: '#ef4444', marginBottom: 8, textTransform: 'uppercase' }}>
                Raison du rejet
              </div>
              <p style={{ fontSize: 14, color: '#e2e8f0', margin: 0 }}>
                {execution.rejectedReason}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
