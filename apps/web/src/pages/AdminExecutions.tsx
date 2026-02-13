import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { TaskExecutionStatus, isWaitingForProof, isWaitingForValidation, isCompleted, isRejected } from '../models/proof'
import { getTaskById } from '../models/task'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
const API_KEY = import.meta.env.VITE_API_KEY

interface PaymentIntent {
  id: string
  taskExecutionId: string
  amount: number
  currency: string
  status: 'pending' | 'authorized' | 'captured' | 'canceled'
  capturedAt?: string
}

function getStatusLabel(status: TaskExecutionStatus): string {
  switch (status) {
    case TaskExecutionStatus.PENDING:
      return 'En attente'
    case TaskExecutionStatus.PROCESSING:
      return 'En traitement'
    case TaskExecutionStatus.WAITING_PROOF:
      return 'En attente de preuve'
    case TaskExecutionStatus.WAITING_VALIDATION:
      return 'En attente de validation'
    case TaskExecutionStatus.COMPLETED:
      return 'Terminée'
    case TaskExecutionStatus.REJECTED:
      return 'Rejetée'
    default:
      return status
  }
}

function getStatusColor(status: TaskExecutionStatus): { bg: string; text: string } {
  if (isCompleted(status)) {
    return { bg: '#064e3b', text: '#6ee7b7' }
  }
  if (isRejected(status)) {
    return { bg: '#7f1d1d', text: '#fca5a5' }
  }
  if (isWaitingForProof(status) || isWaitingForValidation(status)) {
    return { bg: '#1e3a5f', text: '#93c5fd' }
  }
  return { bg: '#374151', text: '#d1d5db' }
}

export default function AdminExecutions() {
  const [payments, setPayments] = useState<Record<string, PaymentIntent>>({})
  const [executions, setExecutions] = useState<any[]>([])

  useEffect(() => {
    loadPayments()
    loadExecutions()
  }, [])

  async function loadExecutions() {
    try {
      const res = await fetch(`${API_BASE_URL}/v4/admin/executions`, {
        headers: { 'x-api-key': API_KEY || '' },
      })
      if (res.ok) {
        const data = await res.json()
        setExecutions(data.executions || [])
      }
    } catch (error) {
      console.error('Erreur chargement exécutions:', error)
    }
  }

  async function loadPayments() {
    try {
      const res = await fetch(`${API_BASE_URL}/v4/admin/payments`, {
        headers: {
          'x-api-key': API_KEY || '',
        },
      })
      if (res.ok) {
        const data = await res.json()
        const paymentsMap: Record<string, PaymentIntent> = {}
        data.payments?.forEach((p: PaymentIntent) => {
          paymentsMap[p.taskExecutionId] = p
        })
        setPayments(paymentsMap)
      }
    } catch (error) {
      console.error('Erreur chargement paiements:', error)
    }
  }

  function getPaymentStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending: 'En attente',
      authorized: 'Autorisé',
      captured: 'Capturé',
      canceled: 'Annulé',
    }
    return labels[status] || status
  }

  function getPaymentStatusColor(status: string): { bg: string; text: string } {
    if (status === 'captured') {
      return { bg: '#064e3b', text: '#6ee7b7' }
    }
    if (status === 'canceled') {
      return { bg: '#7f1d1d', text: '#fca5a5' }
    }
    if (status === 'authorized') {
      return { bg: '#1e3a5f', text: '#93c5fd' }
    }
    return { bg: '#374151', text: '#d1d5db' }
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
          <h1 style={{ fontSize: 32, margin: 0, marginBottom: 8 }}>
            Exécutions de tâches
          </h1>
          <p style={{ fontSize: 16, color: '#94a3b8', margin: 0 }}>
            Suivi des exécutions et validation des preuves
          </p>
        </div>

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
                  ID
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
                  Tâche
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
                  Utilisateur
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
                  Statut
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
                  Preuve
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
                  Validation
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
                  Paiement
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
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {executions.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>
                    Aucune exécution trouvée
                  </td>
                </tr>
              ) : (
                executions.map((execution, index) => {
                  const task = getTaskById(execution.taskId)
                  const statusColor = getStatusColor(execution.status as TaskExecutionStatus)
                  return (
                    <tr
                      key={execution.id}
                      style={{
                        borderBottom:
                          index < executions.length - 1
                            ? '1px solid #334155'
                            : 'none',
                      }}
                    >
                      <td
                        style={{
                          padding: '12px 16px',
                          fontSize: 13,
                          fontFamily: 'monospace',
                          color: '#64748b',
                        }}
                      >
                        <Link
                          to={`/admin/executions/${execution.id}`}
                          style={{
                            color: '#60a5fa',
                            textDecoration: 'none',
                          }}
                        >
                          {execution.id}
                        </Link>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 14 }}>
                        {task?.name || execution.taskId}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: '#94a3b8' }}>
                        {execution.userId}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13 }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '4px 8px',
                            borderRadius: 4,
                            backgroundColor: statusColor.bg,
                            color: statusColor.text,
                            fontSize: 11,
                            fontWeight: 500,
                          }}
                        >
                          {getStatusLabel(execution.status as TaskExecutionStatus)}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13 }}>
                        {execution.proofUrl ? (
                          <div>
                            <a
                              href={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}${execution.proofUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: 'inline-block',
                                padding: '4px 8px',
                                borderRadius: 4,
                                backgroundColor: '#064e3b',
                                color: '#6ee7b7',
                                fontSize: 11,
                                textDecoration: 'none',
                              }}
                            >
                              ✓ Reçue
                            </a>
                            {execution.proofUploadedAt && (
                              <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                                {new Date(execution.proofUploadedAt).toLocaleDateString('fr-FR')}
                              </div>
                            )}
                          </div>
                        ) : task?.requiresProof ? (
                          <span style={{ color: '#64748b' }}>—</span>
                        ) : (
                          <span style={{ color: '#64748b' }}>Non requise</span>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13 }}>
                        {execution.validatedAt ? (
                          <div>
                            <div
                              style={{
                                display: 'inline-block',
                                padding: '4px 8px',
                                borderRadius: 4,
                                backgroundColor: '#064e3b',
                                color: '#6ee7b7',
                                fontSize: 11,
                                marginBottom: 4,
                              }}
                            >
                              ✓ Validée
                            </div>
                            {execution.validatedBy && (
                              <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                                par {execution.validatedBy}
                              </div>
                            )}
                          </div>
                        ) : execution.rejectedReason ? (
                          <div>
                            <div
                              style={{
                                display: 'inline-block',
                                padding: '4px 8px',
                                borderRadius: 4,
                                backgroundColor: '#7f1d1d',
                                color: '#fca5a5',
                                fontSize: 11,
                                marginBottom: 4,
                              }}
                            >
                              ✗ Rejetée
                            </div>
                            <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                              {execution.rejectedReason}
                            </div>
                          </div>
                        ) : (
                          <span style={{ color: '#64748b' }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13 }}>
                        {payments[execution.id] ? (
                          <div>
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '4px 8px',
                                borderRadius: 4,
                                backgroundColor: getPaymentStatusColor(payments[execution.id].status).bg,
                                color: getPaymentStatusColor(payments[execution.id].status).text,
                                fontSize: 11,
                                marginBottom: 4,
                              }}
                            >
                              {getPaymentStatusLabel(payments[execution.id].status)}
                            </span>
                            <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                              {payments[execution.id].amount} {payments[execution.id].currency}
                            </div>
                            {payments[execution.id].capturedAt && (
                              <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                                {new Date(payments[execution.id].capturedAt).toLocaleDateString('fr-FR')}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span style={{ color: '#64748b' }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 12, color: '#64748b' }}>
                        {new Date(execution.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
