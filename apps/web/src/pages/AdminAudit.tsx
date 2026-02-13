import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getTaskById } from '../models/task'
import { useUserRole } from '../hooks/useUserRole'
import { canAccessAudit } from '../models/user'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
const API_KEY = import.meta.env.VITE_API_KEY

interface AuditLog {
  id: string
  eventType: string
  entityType: string
  entityId: string
  actorType: string
  actorId?: string
  metadata: Record<string, unknown>
  createdAt: string
}

function getEventTypeLabel(eventType: string): string {
  const labels: Record<string, string> = {
    TASK_EXECUTION_CREATED: 'Exécution créée',
    PROOF_UPLOADED: 'Preuve uploadée',
    STATUS_CHANGED: 'Statut modifié',
    VALIDATION_APPROVED: 'Validation approuvée',
    VALIDATION_REJECTED: 'Validation rejetée',
    TASK_COMPLETED: 'Tâche terminée',
    TASK_REJECTED: 'Tâche rejetée',
  }
  return labels[eventType] || eventType
}

function getActorLabel(log: AuditLog): string {
  if (log.actorType === 'admin') {
    return 'Admin'
  }
  if (log.actorType === 'user') {
    return `Utilisateur ${log.actorId || 'N/A'}`
  }
  return 'Système'
}

export default function AdminAudit() {
  const userRole = useUserRole()
  const { executionId } = useParams<{ executionId?: string }>()
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLogs()
  }, [executionId])

  async function loadLogs() {
    try {
      const url = executionId
        ? `${API_BASE_URL}/v4/admin/audit/executions/${executionId}`
        : `${API_BASE_URL}/v4/admin/audit/logs`
      const res = await fetch(url, {
        headers: {
          'x-api-key': API_KEY || '',
        },
      })
      if (res.ok) {
        const data = await res.json()
        setLogs(data.logs || [])
      }
    } catch (error) {
      console.error('Erreur chargement audit logs:', error)
    } finally {
      setLoading(false)
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

  if (userRole && !canAccessAudit(userRole)) {
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
          <h1 style={{ fontSize: 32, margin: 0, marginBottom: 8 }}>Audit Logs</h1>
          <p style={{ fontSize: 16, color: '#94a3b8', margin: 0 }}>
            {executionId
              ? `Logs pour l'exécution ${executionId}`
              : `Historique complet (${logs.length} entrées)`}
          </p>
        </div>

        {logs.length === 0 ? (
          <div
            style={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: 8,
              padding: 48,
              textAlign: 'center',
            }}
          >
            <p style={{ fontSize: 16, color: '#94a3b8' }}>Aucun log d'audit</p>
          </div>
        ) : (
          <div
            style={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: 8,
              overflow: 'hidden',
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #334155' }}>
                  <th
                    style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontSize: 12,
                      fontWeight: 600,
                      color: '#94a3b8',
                      textTransform: 'uppercase',
                    }}
                  >
                    Date
                  </th>
                  <th
                    style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontSize: 12,
                      fontWeight: 600,
                      color: '#94a3b8',
                      textTransform: 'uppercase',
                    }}
                  >
                    Événement
                  </th>
                  <th
                    style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontSize: 12,
                      fontWeight: 600,
                      color: '#94a3b8',
                      textTransform: 'uppercase',
                    }}
                  >
                    Acteur
                  </th>
                  <th
                    style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontSize: 12,
                      fontWeight: 600,
                      color: '#94a3b8',
                      textTransform: 'uppercase',
                    }}
                  >
                    Entité
                  </th>
                  <th
                    style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontSize: 12,
                      fontWeight: 600,
                      color: '#94a3b8',
                      textTransform: 'uppercase',
                    }}
                  >
                    Métadonnées
                  </th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, index) => {
                  const task = log.entityType === 'taskExecution' ? getTaskById(log.entityId) : null
                  return (
                    <tr
                      key={log.id}
                      style={{
                        borderBottom:
                          index < logs.length - 1 ? '1px solid #334155' : 'none',
                      }}
                    >
                      <td style={{ padding: '12px 16px', fontSize: 13, color: '#64748b' }}>
                        {new Date(log.createdAt).toLocaleString('fr-FR')}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13 }}>
                        {getEventTypeLabel(log.eventType)}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: '#94a3b8' }}>
                        {getActorLabel(log)}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13 }}>
                        <div>
                          <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#64748b' }}>
                            {log.entityId}
                          </div>
                          {task && (
                            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                              {task.name}
                            </div>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 12 }}>
                        <pre
                          style={{
                            margin: 0,
                            color: '#94a3b8',
                            fontFamily: 'monospace',
                            fontSize: 11,
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            maxWidth: 300,
                          }}
                        >
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
