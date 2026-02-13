import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useUserRole } from '../hooks/useUserRole'
import { canAccessAdminPanel } from '../models/user'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
const API_KEY = import.meta.env.VITE_API_KEY || ''

interface TaskDefinition {
  taskId: string
  version: string
  category: string
  inputSchema: Record<string, unknown>
  outputFormat: string
  supportedLocales: string[]
  supportedCurrencies: string[]
  pricing?: {
    amount: number
    currency: string
    slaTier: string
    proofIncluded: boolean
  }
}

export default function AdminCatalogue() {
  const userRole = useUserRole()
  const [tasks, setTasks] = useState<TaskDefinition[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userRole && canAccessAdminPanel(userRole)) {
      loadTasks()
    }
  }, [userRole])

  async function loadTasks() {
    try {
      // Utiliser GET /v4/admin/tasks/pricing pour récupérer les tâches
      const res = await fetch(`${API_BASE_URL}/v4/admin/tasks/pricing`, {
        headers: { 'x-api-key': API_KEY },
      })
      if (res.ok) {
        const data = await res.json()
        setTasks(data.tasks || [])
      }
    } catch (error) {
      console.error('Erreur chargement catalogue:', error)
    } finally {
      setLoading(false)
    }
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
              <h1 style={{ fontSize: 32, margin: 0, marginBottom: 8 }}>Catalogue Admin</h1>
              <p style={{ fontSize: 16, color: '#94a3b8', margin: 0 }}>
                Vue d'ensemble du catalogue de tâches (lecture seule)
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
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 24 }}>
          {tasks.map((task) => (
            <div
              key={`${task.taskId}-${task.version}`}
              style={{
                padding: 24,
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: 8,
              }}
            >
              <div style={{ marginBottom: 16 }}>
                <h3 style={{ fontSize: 20, margin: 0, marginBottom: 4 }}>{task.taskId}</h3>
                <div style={{ fontSize: 14, color: '#94a3b8', marginBottom: 8 }}>
                  v{task.version} • {task.category}
                </div>
                {task.pricing && (
                  <div style={{ fontSize: 16, fontWeight: 600, color: '#3b82f6', marginBottom: 8 }}>
                    {task.pricing.amount} {task.pricing.currency} • {task.pricing.slaTier}
                  </div>
                )}
              </div>

              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>Format de sortie</div>
                <div style={{ fontSize: 14 }}>{task.outputFormat}</div>
              </div>

              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>Locales supportées</div>
                <div style={{ fontSize: 14 }}>{task.supportedLocales.join(', ')}</div>
              </div>

              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>Devises supportées</div>
                <div style={{ fontSize: 14 }}>{task.supportedCurrencies.join(', ')}</div>
              </div>

              {task.pricing?.proofIncluded && (
                <div
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#0f172a',
                    borderRadius: 6,
                    fontSize: 13,
                    color: '#10b981',
                  }}
                >
                  ✓ Preuve incluse
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
