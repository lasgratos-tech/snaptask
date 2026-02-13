import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useUserRole } from '../hooks/useUserRole'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
const API_KEY = import.meta.env.VITE_API_KEY || ''

interface TaskPricing {
  taskId: string
  version: string
  category: string
  pricing: {
    amount: number
    currency: string
    slaTier: 'standard' | 'priority' | 'enterprise'
    proofIncluded: boolean
  }
}

interface PricingHistory {
  id: string
  taskId: string
  version: string
  oldPricing: TaskPricing['pricing'] | null
  newPricing: TaskPricing['pricing']
  changedBy: string
  changedAt: string
  reason?: string
}

export default function AdminPricing() {
  const userRole = useUserRole()
  const [tasks, setTasks] = useState<TaskPricing[]>([])
  const [selectedTask, setSelectedTask] = useState<TaskPricing | null>(null)
  const [history, setHistory] = useState<PricingHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    amount: 0,
    currency: 'EUR',
    slaTier: 'standard' as 'standard' | 'priority' | 'enterprise',
    proofIncluded: false,
    reason: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (userRole === 'admin') {
      loadTasks()
    }
  }, [userRole])

  useEffect(() => {
    if (selectedTask) {
      loadHistory(selectedTask.taskId, selectedTask.version)
      setFormData({
        amount: selectedTask.pricing.amount,
        currency: selectedTask.pricing.currency,
        slaTier: selectedTask.pricing.slaTier,
        proofIncluded: selectedTask.pricing.proofIncluded,
        reason: '',
      })
    }
  }, [selectedTask])

  async function loadTasks() {
    try {
      const res = await fetch(`${API_BASE_URL}/v4/admin/tasks/pricing`, {
        headers: { 'x-api-key': API_KEY || '' },
      })
      if (res.ok) {
        const data = await res.json()
        setTasks(data.tasks || [])
      }
    } catch (error) {
      console.error('Erreur chargement tâches:', error)
    } finally {
      setLoading(false)
    }
  }

  async function loadHistory(taskId: string, version: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/v4/admin/tasks/${taskId}/${version}/pricing/history`, {
        headers: { 'x-api-key': API_KEY || '' },
      })
      if (res.ok) {
        const data = await res.json()
        setHistory(data.history || [])
      }
    } catch (error) {
      console.error('Erreur chargement historique:', error)
    }
  }

  async function savePricing() {
    if (!selectedTask) return

    setSaving(true)
    try {
      const res = await fetch(
        `${API_BASE_URL}/v4/admin/tasks/${selectedTask.taskId}/${selectedTask.version}/pricing`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_KEY || '',
          },
          body: JSON.stringify({
            amount: formData.amount,
            currency: formData.currency,
            slaTier: formData.slaTier,
            proofIncluded: formData.proofIncluded,
            reason: formData.reason || undefined,
          }),
        },
      )

      if (res.ok) {
        await loadTasks()
        await loadHistory(selectedTask.taskId, selectedTask.version)
        setEditing(false)
        setSelectedTask(null)
      } else {
        alert('Erreur lors de la sauvegarde')
      }
    } catch (error) {
      console.error('Erreur sauvegarde pricing:', error)
      alert('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  if (userRole !== 'admin') {
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
      <div style={{ maxWidth: 1600, margin: '0 auto' }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h1 style={{ fontSize: 32, margin: 0, marginBottom: 8 }}>Gestion du Pricing</h1>
              <p style={{ fontSize: 16, color: '#94a3b8', margin: 0 }}>
                Gérer les prix et SLA des tâches
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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Liste des tâches */}
          <div>
            <h2 style={{ fontSize: 20, marginBottom: 16 }}>Tâches</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {tasks.map((task) => (
                <div
                  key={`${task.taskId}-${task.version}`}
                  onClick={() => {
                    setSelectedTask(task)
                    setEditing(false)
                  }}
                  style={{
                    padding: 16,
                    backgroundColor: selectedTask?.taskId === task.taskId ? '#1e293b' : '#1e293b',
                    border: selectedTask?.taskId === task.taskId ? '2px solid #3b82f6' : '1px solid #334155',
                    borderRadius: 8,
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{task.taskId}</div>
                  <div style={{ fontSize: 14, color: '#94a3b8', marginBottom: 8 }}>
                    {task.category} • v{task.version}
                  </div>
                  <div style={{ fontSize: 14 }}>
                    {task.pricing.amount} {task.pricing.currency} • {task.pricing.slaTier}
                    {task.pricing.proofIncluded && ' • Preuve incluse'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Détails et édition */}
          <div>
            {selectedTask ? (
              <>
                <h2 style={{ fontSize: 20, marginBottom: 16 }}>Détails</h2>
                {!editing ? (
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ padding: 16, backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}>
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>Montant</div>
                        <div style={{ fontSize: 18, fontWeight: 600 }}>
                          {selectedTask.pricing.amount} {selectedTask.pricing.currency}
                        </div>
                      </div>
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>SLA Tier</div>
                        <div style={{ fontSize: 14 }}>{selectedTask.pricing.slaTier}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>Preuve incluse</div>
                        <div style={{ fontSize: 14 }}>{selectedTask.pricing.proofIncluded ? 'Oui' : 'Non'}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => setEditing(true)}
                      style={{
                        marginTop: 16,
                        padding: '8px 16px',
                        backgroundColor: '#3b82f6',
                        border: 'none',
                        borderRadius: 6,
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: 14,
                      }}
                    >
                      Modifier
                    </button>
                  </div>
                ) : (
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>
                          Montant
                        </label>
                        <input
                          type="number"
                          value={formData.amount}
                          onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            backgroundColor: '#0f172a',
                            border: '1px solid #334155',
                            borderRadius: 6,
                            color: 'white',
                            fontSize: 14,
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>
                          Devise
                        </label>
                        <select
                          value={formData.currency}
                          onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
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
                          <option value="EUR">EUR</option>
                          <option value="USD">USD</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>
                          SLA Tier
                        </label>
                        <select
                          value={formData.slaTier}
                          onChange={(e) =>
                            setFormData({ ...formData, slaTier: e.target.value as 'standard' | 'priority' | 'enterprise' })
                          }
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
                          <option value="standard">Standard</option>
                          <option value="priority">Priority</option>
                          <option value="enterprise">Enterprise</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                          <input
                            type="checkbox"
                            checked={formData.proofIncluded}
                            onChange={(e) => setFormData({ ...formData, proofIncluded: e.target.checked })}
                            style={{ width: 16, height: 16 }}
                          />
                          Preuve incluse
                        </label>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>
                          Raison du changement (optionnel)
                        </label>
                        <textarea
                          value={formData.reason}
                          onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                          rows={3}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            backgroundColor: '#0f172a',
                            border: '1px solid #334155',
                            borderRadius: 6,
                            color: 'white',
                            fontSize: 14,
                            fontFamily: 'inherit',
                          }}
                        />
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={savePricing}
                          disabled={saving}
                          style={{
                            flex: 1,
                            padding: '8px 16px',
                            backgroundColor: '#3b82f6',
                            border: 'none',
                            borderRadius: 6,
                            color: 'white',
                            cursor: saving ? 'not-allowed' : 'pointer',
                            fontSize: 14,
                            opacity: saving ? 0.5 : 1,
                          }}
                        >
                          {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                        </button>
                        <button
                          onClick={() => {
                            setEditing(false)
                            setFormData({
                              amount: selectedTask.pricing.amount,
                              currency: selectedTask.pricing.currency,
                              slaTier: selectedTask.pricing.slaTier,
                              proofIncluded: selectedTask.pricing.proofIncluded,
                              reason: '',
                            })
                          }}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: '#334155',
                            border: 'none',
                            borderRadius: 6,
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: 14,
                          }}
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Historique */}
                <div>
                  <h3 style={{ fontSize: 16, marginBottom: 12 }}>Historique des changements</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {history.length === 0 ? (
                      <div style={{ padding: 16, backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#94a3b8', fontSize: 14 }}>
                        Aucun historique disponible
                      </div>
                    ) : (
                      history.map((h) => (
                        <div
                          key={h.id}
                          style={{
                            padding: 12,
                            backgroundColor: '#1e293b',
                            border: '1px solid #334155',
                            borderRadius: 8,
                            fontSize: 14,
                          }}
                        >
                          <div style={{ marginBottom: 4 }}>
                            <span style={{ fontWeight: 600 }}>
                              {h.newPricing.amount} {h.newPricing.currency}
                            </span>
                            {h.oldPricing && (
                              <span style={{ color: '#94a3b8', marginLeft: 8 }}>
                                (était: {h.oldPricing.amount} {h.oldPricing.currency})
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>
                            {h.newPricing.slaTier} • {h.newPricing.proofIncluded ? 'Preuve incluse' : 'Preuve non incluse'}
                          </div>
                          <div style={{ fontSize: 12, color: '#94a3b8' }}>
                            Par {h.changedBy} le {new Date(h.changedAt).toLocaleString('fr-FR')}
                            {h.reason && ` • ${h.reason}`}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div style={{ padding: 24, backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#94a3b8', textAlign: 'center' }}>
                Sélectionnez une tâche pour voir les détails
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
