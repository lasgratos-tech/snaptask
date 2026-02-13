import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { useApiKey } from '../hooks/useApiKey'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

interface TaskExecution {
  id: string
  taskId: string
  status: 'PENDING' | 'PROCESSING' | 'WAITING_PROOF' | 'WAITING_VALIDATION' | 'COMPLETED' | 'REJECTED'
  deliverableUrl?: string
  proofUrl?: string
  createdAt: string
  updatedAt: string
}

export default function MyTasks() {
  const navigate = useNavigate()
  const apiKey = useApiKey()
  const [executions, setExecutions] = useState<TaskExecution[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadExecutions()
  }, [])

  async function loadExecutions() {
    try {
      if (!apiKey) {
        navigate('/login')
        return
      }

      const res = await fetch(`${API_BASE_URL}/v4/user/executions`, {
        headers: { 'x-api-key': apiKey },
      })
      if (res.ok) {
        const data = await res.json()
        setExecutions(data.executions || [])
      }
    } catch (error) {
      console.error('Erreur chargement tâches:', error)
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

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        color: 'white',
        padding: '48px 24px',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: 32, margin: 0, marginBottom: 8 }}>Mes tâches</h1>
            <p style={{ fontSize: 16, color: '#94a3b8', margin: 0 }}>
              Suivez l'avancement de vos tâches
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <Link
              to="/catalogue"
              style={{
                padding: '10px 20px',
                backgroundColor: '#3b82f6',
                border: 'none',
                borderRadius: 6,
                color: 'white',
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              Nouvelle tâche
            </Link>
            <Link
              to="/profile"
              style={{
                padding: '10px 20px',
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: 6,
                color: 'white',
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              Profil
            </Link>
          </div>
        </div>

        {executions.length === 0 ? (
          <div
            style={{
              padding: 48,
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: 12,
              textAlign: 'center',
            }}
          >
            <p style={{ fontSize: 16, color: '#94a3b8', marginBottom: 16 }}>
              Aucune tâche pour le moment
            </p>
            <Link
              to="/catalogue"
              style={{
                display: 'inline-block',
                padding: '10px 20px',
                backgroundColor: '#3b82f6',
                border: 'none',
                borderRadius: 6,
                color: 'white',
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              Parcourir le catalogue
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {executions.map((execution) => (
              <div
                key={execution.id}
                onClick={() => navigate(`/tasks/${execution.id}`)}
                style={{
                  padding: 20,
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: 8,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#475569'
                  e.currentTarget.style.backgroundColor = '#334155'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#334155'
                  e.currentTarget.style.backgroundColor = '#1e293b'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <h3 style={{ fontSize: 18, margin: 0, marginBottom: 4 }}>
                      {execution.taskId}
                    </h3>
                    <p style={{ fontSize: 14, color: '#94a3b8', margin: 0 }}>
                      Créée le {new Date(execution.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#0f172a',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 500,
                      color: getStatusColor(execution.status),
                    }}
                  >
                    {getStatusLabel(execution.status)}
                  </div>
                </div>
                {execution.deliverableUrl && (
                  <div style={{ marginTop: 12, fontSize: 14, color: '#3b82f6' }}>
                    ✓ Livrable disponible
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
