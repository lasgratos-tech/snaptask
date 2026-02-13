import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useUserRole } from '../hooks/useUserRole'
import { canAccessAdminPanel, canAccessAudit } from '../models/user'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
const API_KEY = import.meta.env.VITE_API_KEY

interface KPIs {
  compliance: {
    totalExecutions: number
    completedExecutions: number
    waitingValidation: number
    rejectedExecutions: number
    executionsWithProof: number
    completionRate: number
  }
  finance: {
    totalPayments: number
    capturedPayments: number
    authorizedPayments: number
    canceledPayments: number
    totalAmount: number
    authorizedAmount: number
    captureRate: number
  }
  audit: {
    totalAuditLogs: number
    recentAuditLogs: number
  }
}

interface ComplianceExecution {
  id: string
  taskId: string
  userId: string
  status: string
  proofUrl?: string
  proofUploadedAt?: string
  validatedAt?: string
  validatedBy?: string
  validationDecision?: string
  proofType: string
  lastAuditLog: {
    eventType: string
    createdAt: string
    actorType: string
  } | null
  createdAt: string
}

interface FinancePayment {
  id: string
  taskExecutionId: string
  amount: number
  currency: string
  status: string
  stripePaymentIntentId?: string
  authorizedAt?: string
  capturedAt?: string
  canceledAt?: string
  onHoldReason?: string
  createdAt: string
  auditLogs: Array<{
    id: string
    eventType: string
    createdAt: string
    metadata: Record<string, unknown>
  }>
}

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

export default function AdminComplianceFinance() {
  const userRole = useUserRole()
  const [kpis, setKpis] = useState<KPIs | null>(null)
  const [complianceExecutions, setComplianceExecutions] = useState<ComplianceExecution[]>([])
  const [financePayments, setFinancePayments] = useState<FinancePayment[]>([])
  const [auditTimeline, setAuditTimeline] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'compliance' | 'finance' | 'audit'>('overview')

  // Filtres
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [proofTypeFilter, setProofTypeFilter] = useState<string>('')
  const [dateFromFilter, setDateFromFilter] = useState<string>('')
  const [dateToFilter, setDateToFilter] = useState<string>('')

  useEffect(() => {
    if (userRole === 'admin') {
      loadKPIs()
    }
    if (userRole === 'admin' || userRole === 'reviewer') {
      loadCompliance()
      loadAuditTimeline()
    }
    if (userRole === 'admin') {
      loadFinance()
    }
  }, [userRole])

  useEffect(() => {
    if (userRole === 'admin' || userRole === 'reviewer') {
      loadCompliance()
    }
  }, [statusFilter, proofTypeFilter, dateFromFilter, dateToFilter, userRole])

  async function loadKPIs() {
    try {
      const res = await fetch(`${API_BASE_URL}/v4/admin/dashboard/kpis`, {
        headers: { 'x-api-key': API_KEY || '' },
      })
      if (res.ok) {
        const data = await res.json()
        setKpis(data)
      }
    } catch (error) {
      console.error('Erreur chargement KPIs:', error)
    } finally {
      setLoading(false)
    }
  }

  async function loadCompliance() {
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.append('status', statusFilter)
      if (proofTypeFilter) params.append('proofType', proofTypeFilter)
      if (dateFromFilter) params.append('dateFrom', dateFromFilter)
      if (dateToFilter) params.append('dateTo', dateToFilter)
      params.append('limit', '100')

      const res = await fetch(`${API_BASE_URL}/v4/admin/dashboard/compliance?${params}`, {
        headers: { 'x-api-key': API_KEY || '' },
      })
      if (res.ok) {
        const data = await res.json()
        setComplianceExecutions(data.executions || [])
      }
    } catch (error) {
      console.error('Erreur chargement conformité:', error)
    }
  }

  async function loadFinance() {
    try {
      const res = await fetch(`${API_BASE_URL}/v4/admin/dashboard/finance?limit=100`, {
        headers: { 'x-api-key': API_KEY || '' },
      })
      if (res.ok) {
        const data = await res.json()
        setFinancePayments(data.payments || [])
      }
    } catch (error) {
      console.error('Erreur chargement finance:', error)
    }
  }

  async function loadAuditTimeline() {
    try {
      const res = await fetch(`${API_BASE_URL}/v4/admin/dashboard/audit-timeline?limit=200`, {
        headers: { 'x-api-key': API_KEY || '' },
      })
      if (res.ok) {
        const data = await res.json()
        setAuditTimeline(data.logs || [])
      }
    } catch (error) {
      console.error('Erreur chargement audit:', error)
    }
  }

  function getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      PENDING: 'En attente',
      PROCESSING: 'En traitement',
      WAITING_PROOF: 'En attente de preuve',
      WAITING_VALIDATION: 'En attente de validation',
      COMPLETED: 'Terminée',
      REJECTED: 'Rejetée',
    }
    return labels[status] || status
  }

  function getStatusColor(status: string): { bg: string; text: string } {
    if (status === 'COMPLETED') {
      return { bg: '#064e3b', text: '#6ee7b7' }
    }
    if (status === 'REJECTED') {
      return { bg: '#7f1d1d', text: '#fca5a5' }
    }
    if (status === 'WAITING_PROOF' || status === 'WAITING_VALIDATION') {
      return { bg: '#1e3a5f', text: '#93c5fd' }
    }
    return { bg: '#374151', text: '#d1d5db' }
  }

  function getPaymentStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending: 'En attente',
      authorized: 'Autorisé (ESCROW)',
      captured: 'Capturé',
      canceled: 'Annulé',
      on_hold: 'En attente (litige)',
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
    if (status === 'on_hold') {
      return { bg: '#78350f', text: '#fcd34d' }
    }
    if (status === 'authorized') {
      return { bg: '#1e3a5f', text: '#93c5fd' }
    }
    return { bg: '#374151', text: '#d1d5db' }
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
      PAYMENT_AUTHORIZED: 'Paiement autorisé',
      PAYMENT_CAPTURED: 'Paiement capturé',
      PAYMENT_CANCELED: 'Paiement annulé',
      TASK_STEP_CHANGED: 'Étape modifiée',
    }
    return labels[eventType] || eventType
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

  if (userRole === 'ops') {
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
            Cette page nécessite le rôle admin ou reviewer.
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
      <div style={{ maxWidth: 1600, margin: '0 auto' }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h1 style={{ fontSize: 32, margin: 0, marginBottom: 8 }}>Dashboard Conformité & Finance</h1>
              <p style={{ fontSize: 16, color: '#94a3b8', margin: 0 }}>
                Vue d'ensemble traçable des exécutions, preuves et paiements
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

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid #334155' }}>
            {userRole === 'admin' && (
              <button
                onClick={() => setActiveTab('overview')}
                style={{
                  padding: '12px 24px',
                  backgroundColor: activeTab === 'overview' ? '#1e293b' : 'transparent',
                  border: 'none',
                  borderBottom: activeTab === 'overview' ? '2px solid #60a5fa' : '2px solid transparent',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: activeTab === 'overview' ? 600 : 400,
                }}
              >
                Vue d'ensemble
              </button>
            )}
            {(userRole === 'admin' || userRole === 'reviewer') && (
              <>
                <button
                  onClick={() => setActiveTab('compliance')}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: activeTab === 'compliance' ? '#1e293b' : 'transparent',
                    border: 'none',
                    borderBottom: activeTab === 'compliance' ? '2px solid #60a5fa' : '2px solid transparent',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: 14,
                    fontWeight: activeTab === 'compliance' ? 600 : 400,
                  }}
                >
                  Conformité
                </button>
                <button
                  onClick={() => setActiveTab('audit')}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: activeTab === 'audit' ? '#1e293b' : 'transparent',
                    border: 'none',
                    borderBottom: activeTab === 'audit' ? '2px solid #60a5fa' : '2px solid transparent',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: 14,
                    fontWeight: activeTab === 'audit' ? 600 : 400,
                  }}
                >
                  Audit Timeline
                </button>
              </>
            )}
            {userRole === 'admin' && (
              <button
                onClick={() => setActiveTab('finance')}
                style={{
                  padding: '12px 24px',
                  backgroundColor: activeTab === 'finance' ? '#1e293b' : 'transparent',
                  border: 'none',
                  borderBottom: activeTab === 'finance' ? '2px solid #60a5fa' : '2px solid transparent',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: activeTab === 'finance' ? 600 : 400,
                }}
              >
                Finance
              </button>
            )}
          </div>
        </div>

        {/* Vue d'ensemble */}
        {activeTab === 'overview' && userRole === 'admin' && kpis && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16, marginBottom: 32 }}>
              {/* KPIs Conformité */}
              <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, padding: 20 }}>
                <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 8 }}>Exécutions totales</div>
                <div style={{ fontSize: 32, fontWeight: 600 }}>{kpis.compliance.totalExecutions}</div>
              </div>
              <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, padding: 20 }}>
                <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 8 }}>Terminées</div>
                <div style={{ fontSize: 32, fontWeight: 600, color: '#6ee7b7' }}>{kpis.compliance.completedExecutions}</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                  {kpis.compliance.completionRate.toFixed(1)}%
                </div>
              </div>
              <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, padding: 20 }}>
                <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 8 }}>En attente validation</div>
                <div style={{ fontSize: 32, fontWeight: 600, color: '#93c5fd' }}>{kpis.compliance.waitingValidation}</div>
              </div>
              <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, padding: 20 }}>
                <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 8 }}>Avec preuve</div>
                <div style={{ fontSize: 32, fontWeight: 600 }}>{kpis.compliance.executionsWithProof}</div>
              </div>

              {/* KPIs Finance */}
              <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, padding: 20 }}>
                <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 8 }}>Paiements capturés</div>
                <div style={{ fontSize: 32, fontWeight: 600, color: '#6ee7b7' }}>{kpis.finance.capturedPayments}</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                  {kpis.finance.captureRate.toFixed(1)}%
                </div>
              </div>
              <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, padding: 20 }}>
                <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 8 }}>Montant total</div>
                <div style={{ fontSize: 32, fontWeight: 600, color: '#6ee7b7' }}>
                  {kpis.finance.totalAmount.toLocaleString('fr-FR')} €
                </div>
              </div>
              <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, padding: 20 }}>
                <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 8 }}>Autorisés (non capturés)</div>
                <div style={{ fontSize: 32, fontWeight: 600, color: '#93c5fd' }}>
                  {kpis.finance.authorizedAmount.toLocaleString('fr-FR')} €
                </div>
              </div>

              {/* KPIs Audit */}
              <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, padding: 20 }}>
                <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 8 }}>Logs d'audit</div>
                <div style={{ fontSize: 32, fontWeight: 600 }}>{kpis.audit.totalAuditLogs}</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                  {kpis.audit.recentAuditLogs} dernières 24h
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Table Conformité */}
        {activeTab === 'compliance' && (userRole === 'admin' || userRole === 'reviewer') && (
          <div>
            {/* Filtres */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: 6,
                  color: 'white',
                  fontSize: 14,
                }}
              >
                <option value="">Tous les statuts</option>
                <option value="PENDING">En attente</option>
                <option value="PROCESSING">En traitement</option>
                <option value="WAITING_PROOF">En attente de preuve</option>
                <option value="WAITING_VALIDATION">En attente de validation</option>
                <option value="COMPLETED">Terminée</option>
                <option value="REJECTED">Rejetée</option>
              </select>
              <select
                value={proofTypeFilter}
                onChange={(e) => setProofTypeFilter(e.target.value)}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: 6,
                  color: 'white',
                  fontSize: 14,
                }}
              >
                <option value="">Tous les types de preuve</option>
                <option value="none">Aucune</option>
                <option value="file">Fichier</option>
                <option value="human_validation">Validation humaine</option>
              </select>
              <input
                type="date"
                value={dateFromFilter}
                onChange={(e) => setDateFromFilter(e.target.value)}
                placeholder="Date début"
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: 6,
                  color: 'white',
                  fontSize: 14,
                }}
              />
              <input
                type="date"
                value={dateToFilter}
                onChange={(e) => setDateToFilter(e.target.value)}
                placeholder="Date fin"
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: 6,
                  color: 'white',
                  fontSize: 14,
                }}
              />
            </div>

            {/* Table */}
            <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #334155' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
                      ID Exécution
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
                      Tâche
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
                      Statut
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
                      Type preuve
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
                      Validation
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
                      Dernier audit
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
                      Date création
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {complianceExecutions.map((exec, index) => (
                    <tr
                      key={exec.id}
                      style={{
                        borderBottom: index < complianceExecutions.length - 1 ? '1px solid #334155' : 'none',
                      }}
                    >
                      <td style={{ padding: '12px 16px', fontSize: 13, fontFamily: 'monospace', color: '#64748b' }}>
                        {exec.id}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13 }}>{exec.taskId}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13 }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '4px 8px',
                            borderRadius: 4,
                            backgroundColor: getStatusColor(exec.status).bg,
                            color: getStatusColor(exec.status).text,
                            fontSize: 11,
                          }}
                        >
                          {getStatusLabel(exec.status)}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13 }}>
                        {exec.proofType !== 'none' ? (
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '4px 8px',
                              borderRadius: 4,
                              backgroundColor: '#1e3a5f',
                              color: '#93c5fd',
                              fontSize: 11,
                            }}
                          >
                            {exec.proofType}
                          </span>
                        ) : (
                          <span style={{ color: '#64748b' }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13 }}>
                        {exec.validationDecision ? (
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '4px 8px',
                              borderRadius: 4,
                              backgroundColor: exec.validationDecision === 'approved' ? '#064e3b' : '#7f1d1d',
                              color: exec.validationDecision === 'approved' ? '#6ee7b7' : '#fca5a5',
                              fontSize: 11,
                            }}
                          >
                            {exec.validationDecision === 'approved' ? 'Approuvée' : 'Rejetée'}
                          </span>
                        ) : (
                          <span style={{ color: '#64748b' }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: '#94a3b8' }}>
                        {exec.lastAuditLog ? (
                          <div>
                            <div style={{ fontSize: 11 }}>{getEventTypeLabel(exec.lastAuditLog.eventType)}</div>
                            <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>
                              {new Date(exec.lastAuditLog.createdAt).toLocaleString('fr-FR')}
                            </div>
                          </div>
                        ) : (
                          <span style={{ color: '#64748b' }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: '#94a3b8' }}>
                        {new Date(exec.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Table Finance */}
        {activeTab === 'finance' && userRole === 'admin' && (
          <div>
            <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #334155' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
                      ID Paiement
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
                      Exécution
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
                      Montant
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
                      Statut
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
                      Dates
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
                      Stripe
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
                      Audit
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {financePayments.map((payment, index) => (
                    <tr
                      key={payment.id}
                      style={{
                        borderBottom: index < financePayments.length - 1 ? '1px solid #334155' : 'none',
                      }}
                    >
                      <td style={{ padding: '12px 16px', fontSize: 13, fontFamily: 'monospace', color: '#64748b' }}>
                        {payment.id}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13, fontFamily: 'monospace', color: '#64748b' }}>
                        {payment.taskExecutionId}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13 }}>
                        {payment.amount.toLocaleString('fr-FR')} {payment.currency}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13 }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '4px 8px',
                            borderRadius: 4,
                            backgroundColor: getPaymentStatusColor(payment.status).bg,
                            color: getPaymentStatusColor(payment.status).text,
                            fontSize: 11,
                          }}
                        >
                          {getPaymentStatusLabel(payment.status)}
                        </span>
                        {payment.onHoldReason && (
                          <div style={{ fontSize: 10, color: '#64748b', marginTop: 4 }}>
                            {payment.onHoldReason}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: '#94a3b8' }}>
                        <div style={{ fontSize: 11 }}>
                          {payment.authorizedAt && (
                            <div>Autorisé: {new Date(payment.authorizedAt).toLocaleString('fr-FR')}</div>
                          )}
                          {payment.capturedAt && (
                            <div>Capturé: {new Date(payment.capturedAt).toLocaleString('fr-FR')}</div>
                          )}
                          {payment.canceledAt && (
                            <div>Annulé: {new Date(payment.canceledAt).toLocaleString('fr-FR')}</div>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13 }}>
                        {payment.stripePaymentIntentId ? (
                          <div>
                            <div style={{ fontSize: 11, fontFamily: 'monospace', color: '#64748b' }}>
                              {payment.stripePaymentIntentId}
                            </div>
                            <a
                              href={`https://dashboard.stripe.com/test/payments/${payment.stripePaymentIntentId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ fontSize: 10, color: '#60a5fa', textDecoration: 'none' }}
                            >
                              Voir dans Stripe →
                            </a>
                          </div>
                        ) : (
                          <span style={{ color: '#64748b' }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13 }}>
                        {payment.auditLogs.length > 0 ? (
                          <div>
                            {payment.auditLogs.map((log) => (
                              <div key={log.id} style={{ fontSize: 11, marginBottom: 4 }}>
                                <span style={{ color: '#94a3b8' }}>{getEventTypeLabel(log.eventType)}</span>
                                <span style={{ color: '#64748b', marginLeft: 8 }}>
                                  {new Date(log.createdAt).toLocaleString('fr-FR')}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span style={{ color: '#64748b' }}>—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Timeline Audit */}
        {activeTab === 'audit' && (userRole === 'admin' || userRole === 'reviewer') && (
          <div>
            <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, padding: 24 }}>
              <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                {auditTimeline.map((log, index) => (
                  <div
                    key={log.id}
                    style={{
                      padding: '16px',
                      borderLeft: '2px solid #334155',
                      marginLeft: 16,
                      marginBottom: index < auditTimeline.length - 1 ? 16 : 0,
                      position: 'relative',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
                          {getEventTypeLabel(log.eventType)}
                        </div>
                        <div style={{ fontSize: 12, color: '#94a3b8' }}>
                          {log.entityType} • {log.entityId}
                        </div>
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>
                        {new Date(log.createdAt).toLocaleString('fr-FR')}
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 8 }}>
                      <span style={{ color: '#64748b' }}>Acteur:</span> {log.actorType}
                      {log.actorId && ` • ${log.actorId}`}
                    </div>
                    {Object.keys(log.metadata).length > 0 && (
                      <div style={{ marginTop: 8, fontSize: 11, color: '#64748b', fontFamily: 'monospace' }}>
                        {JSON.stringify(log.metadata, null, 2)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
