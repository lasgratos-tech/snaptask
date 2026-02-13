import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useUserRole } from '../hooks/useUserRole'
import { canAccessAudit } from '../models/user'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
const API_KEY = import.meta.env.VITE_API_KEY

interface Dispute {
  id: string
  taskExecutionId: string
  userId: string
  type: 'result' | 'proof' | 'validation'
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED_IN_FAVOR_USER' | 'RESOLVED_IN_FAVOR_SNAPTASK' | 'CLOSED'
  reason: string
  resolution?: string
  decidedBy?: 'admin' | 'reviewer'
  decidedAt?: string
  createdAt: string
}

interface DisputeDetail extends Dispute {
  execution?: {
    id: string
    taskId: string
    status: string
    deliverableUrl?: string
    proofUrl?: string
    validatedAt?: string
    validationDecision?: string
  }
  auditLogs?: Array<{
    id: string
    eventType: string
    createdAt: string
    actorType: string
    metadata: Record<string, unknown>
  }>
}

export default function AdminDisputes() {
  const userRole = useUserRole()
  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [selectedDispute, setSelectedDispute] = useState<DisputeDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [resolution, setResolution] = useState<'RESOLVED_IN_FAVOR_USER' | 'RESOLVED_IN_FAVOR_SNAPTASK'>('RESOLVED_IN_FAVOR_USER')
  const [resolutionComment, setResolutionComment] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    if (userRole === 'admin' || userRole === 'reviewer') {
      loadDisputes()
    }
  }, [userRole, statusFilter])

  async function loadDisputes() {
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.append('status', statusFilter)
      params.append('limit', '100')

      const res = await fetch(`${API_BASE_URL}/v4/admin/disputes?${params}`, {
        headers: { 'x-api-key': API_KEY || '' },
      })
      if (res.ok) {
        const data = await res.json()
        setDisputes(data.disputes || [])
      }
    } catch (error) {
      console.error('Erreur chargement litiges:', error)
    } finally {
      setLoading(false)
    }
  }

  async function loadDisputeDetail(id: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/v4/disputes/${id}`, {
        headers: { 'x-api-key': API_KEY || '' },
      })
      if (res.ok) {
        const data = await res.json()
        setSelectedDispute(data)
      }
    } catch (error) {
      console.error('Erreur chargement détail litige:', error)
    }
  }

  async function handleResolve(disputeId: string) {
    if (!resolutionComment.trim()) {
      alert('Veuillez fournir un commentaire de résolution')
      return
    }

    setProcessing(true)
    try {
      const res = await fetch(`${API_BASE_URL}/v4/admin/disputes/${disputeId}/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY || '',
        },
        body: JSON.stringify({
          resolution,
          resolutionComment: resolutionComment.trim(),
        }),
      })

      if (res.ok) {
        await loadDisputes()
        if (selectedDispute?.id === disputeId) {
          await loadDisputeDetail(disputeId)
        }
        setResolutionComment('')
        alert('Litige résolu avec succès')
      } else {
        const data = await res.json()
        alert(data.error || 'Erreur lors de la résolution')
      }
    } catch (error) {
      console.error('Erreur résolution litige:', error)
      alert('Erreur lors de la résolution')
    } finally {
      setProcessing(false)
    }
  }

  function getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      OPEN: 'Ouvert',
      UNDER_REVIEW: 'En révision',
      RESOLVED_IN_FAVOR_USER: 'Résolu en faveur utilisateur',
      RESOLVED_IN_FAVOR_SNAPTASK: 'Résolu en faveur SnapTask',
      CLOSED: 'Fermé',
    }
    return labels[status] || status
  }

  function getStatusColor(status: string): { bg: string; text: string } {
    if (status === 'RESOLVED_IN_FAVOR_USER') {
      return { bg: '#064e3b', text: '#6ee7b7' }
    }
    if (status === 'RESOLVED_IN_FAVOR_SNAPTASK') {
      return { bg: '#1e3a5f', text: '#93c5fd' }
    }
    if (status === 'CLOSED') {
      return { bg: '#374151', text: '#d1d5db' }
    }
    if (status === 'UNDER_REVIEW') {
      return { bg: '#78350f', text: '#fcd34d' }
    }
    return { bg: '#7f1d1d', text: '#fca5a5' }
  }

  function getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      result: 'Résultat',
      proof: 'Preuve',
      validation: 'Validation',
    }
    return labels[type] || type
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
      <div style={{ maxWidth: 1600, margin: '0 auto' }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h1 style={{ fontSize: 32, margin: 0, marginBottom: 8 }}>Litiges & Arbitrage</h1>
              <p style={{ fontSize: 16, color: '#94a3b8', margin: 0 }}>
                Gestion des litiges et arbitrage
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

          {/* Filtre */}
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
            <option value="OPEN">Ouvert</option>
            <option value="UNDER_REVIEW">En révision</option>
            <option value="RESOLVED_IN_FAVOR_USER">Résolu (utilisateur)</option>
            <option value="RESOLVED_IN_FAVOR_SNAPTASK">Résolu (SnapTask)</option>
            <option value="CLOSED">Fermé</option>
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Liste des litiges */}
          <div>
            <h2 style={{ fontSize: 20, marginBottom: 16 }}>Liste des litiges</h2>
            <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #334155' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
                      ID
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
                      Type
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
                      Statut
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {disputes.map((dispute, index) => (
                    <tr
                      key={dispute.id}
                      onClick={() => loadDisputeDetail(dispute.id)}
                      style={{
                        borderBottom: index < disputes.length - 1 ? '1px solid #334155' : 'none',
                        cursor: 'pointer',
                        backgroundColor: selectedDispute?.id === dispute.id ? '#1e3a5f' : 'transparent',
                      }}
                    >
                      <td style={{ padding: '12px 16px', fontSize: 13, fontFamily: 'monospace', color: '#64748b' }}>
                        {dispute.id.slice(0, 16)}...
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13 }}>{getTypeLabel(dispute.type)}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13 }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '4px 8px',
                            borderRadius: 4,
                            backgroundColor: getStatusColor(dispute.status).bg,
                            color: getStatusColor(dispute.status).text,
                            fontSize: 11,
                          }}
                        >
                          {getStatusLabel(dispute.status)}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: '#94a3b8' }}>
                        {new Date(dispute.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Détail du litige */}
          <div>
            {selectedDispute ? (
              <div>
                <h2 style={{ fontSize: 20, marginBottom: 16 }}>Détail du litige</h2>
                <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, padding: 24 }}>
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>ID</div>
                    <div style={{ fontSize: 14, fontFamily: 'monospace', color: '#64748b' }}>{selectedDispute.id}</div>
                  </div>

                  <div style={{ marginBottom: 24 }}>
                    <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>Type</div>
                    <div style={{ fontSize: 14 }}>{getTypeLabel(selectedDispute.type)}</div>
                  </div>

                  <div style={{ marginBottom: 24 }}>
                    <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>Statut</div>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '4px 8px',
                        borderRadius: 4,
                        backgroundColor: getStatusColor(selectedDispute.status).bg,
                        color: getStatusColor(selectedDispute.status).text,
                        fontSize: 11,
                      }}
                    >
                      {getStatusLabel(selectedDispute.status)}
                    </span>
                  </div>

                  <div style={{ marginBottom: 24 }}>
                    <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>Raison</div>
                    <div style={{ fontSize: 14, padding: '12px', backgroundColor: '#0f172a', borderRadius: 6 }}>
                      {selectedDispute.reason}
                    </div>
                  </div>

                  {selectedDispute.execution && (
                    <div style={{ marginBottom: 24 }}>
                      <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 8 }}>Exécution</div>
                      <div style={{ fontSize: 13, padding: '12px', backgroundColor: '#0f172a', borderRadius: 6 }}>
                        <div>ID: {selectedDispute.execution.id}</div>
                        <div>Tâche: {selectedDispute.execution.taskId}</div>
                        <div>Statut: {selectedDispute.execution.status}</div>
                        {selectedDispute.execution.deliverableUrl && (
                          <div>Livrable: <a href={selectedDispute.execution.deliverableUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#60a5fa' }}>Voir</a></div>
                        )}
                        {selectedDispute.execution.proofUrl && (
                          <div>Preuve: <a href={selectedDispute.execution.proofUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#60a5fa' }}>Voir</a></div>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedDispute.resolution && (
                    <div style={{ marginBottom: 24 }}>
                      <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>Résolution</div>
                      <div style={{ fontSize: 14, padding: '12px', backgroundColor: '#0f172a', borderRadius: 6 }}>
                        {selectedDispute.resolution}
                      </div>
                      {selectedDispute.decidedBy && (
                        <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                          Décidé par {selectedDispute.decidedBy} le {selectedDispute.decidedAt ? new Date(selectedDispute.decidedAt).toLocaleString('fr-FR') : ''}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Arbitrage */}
                  {(selectedDispute.status === 'OPEN' || selectedDispute.status === 'UNDER_REVIEW') && (
                    <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid #334155' }}>
                      <h3 style={{ fontSize: 16, marginBottom: 16 }}>Arbitrage</h3>
                      <div style={{ marginBottom: 16 }}>
                        <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 8 }}>
                          Décision
                        </label>
                        <select
                          value={resolution}
                          onChange={(e) => setResolution(e.target.value as any)}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            backgroundColor: '#0f172a',
                            border: '1px solid #334155',
                            borderRadius: 6,
                            color: 'white',
                            fontSize: 14,
                          }}
                        >
                          <option value="RESOLVED_IN_FAVOR_USER">En faveur de l'utilisateur</option>
                          <option value="RESOLVED_IN_FAVOR_SNAPTASK">En faveur de SnapTask</option>
                        </select>
                      </div>
                      <div style={{ marginBottom: 16 }}>
                        <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 8 }}>
                          Commentaire de résolution *
                        </label>
                        <textarea
                          value={resolutionComment}
                          onChange={(e) => setResolutionComment(e.target.value)}
                          placeholder="Expliquez la décision..."
                          required
                          rows={4}
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
                      </div>
                      <button
                        onClick={() => handleResolve(selectedDispute.id)}
                        disabled={processing || !resolutionComment.trim()}
                        style={{
                          padding: '12px 24px',
                          backgroundColor: processing ? '#475569' : '#2563eb',
                          border: 'none',
                          borderRadius: 6,
                          color: 'white',
                          fontSize: 14,
                          fontWeight: 600,
                          cursor: processing || !resolutionComment.trim() ? 'not-allowed' : 'pointer',
                          opacity: processing || !resolutionComment.trim() ? 0.6 : 1,
                        }}
                      >
                        {processing ? 'Traitement...' : 'Résoudre le litige'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, padding: 48, textAlign: 'center' }}>
                <p style={{ color: '#64748b' }}>Sélectionnez un litige pour voir les détails</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
