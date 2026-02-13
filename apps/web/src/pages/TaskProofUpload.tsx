import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getTaskById } from '../models/task'
import { TaskExecution, TaskExecutionStatus } from '../models/proof'
import { useUserRole } from '../hooks/useUserRole'
import { canUploadProof } from '../models/user'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
const API_KEY = import.meta.env.VITE_API_KEY

export default function TaskProofUpload() {
  const userRole = useUserRole()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [execution, setExecution] = useState<TaskExecution | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) {
      navigate('/dashboard')
      return
    }
    loadExecution()
  }, [id])

  async function loadExecution() {
    try {
      const res = await fetch(`${API_BASE_URL}/v4/admin/tasks/${id}`, {
        headers: {
          'x-api-key': API_KEY || '',
        },
      })
      if (res.ok) {
        const data = await res.json()
        setExecution(data)
        if (data.status !== TaskExecutionStatus.WAITING_PROOF) {
          setError('Cette exécution n\'est pas en attente de preuve')
        }
      } else {
        setError('Exécution non trouvée')
      }
    } catch (err) {
      console.error('Erreur chargement exécution:', err)
      setError('Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file || !id) return

    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch(`${API_BASE_URL}/v4/tasks/${id}/proof/upload`, {
        method: 'POST',
        headers: {
          'x-api-key': API_KEY || '',
        },
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Erreur upload')
      }

      navigate(`/tasks/${execution?.taskId}`)
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'upload')
    } finally {
      setUploading(false)
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
          backgroundColor: '#0a0e27',
          color: 'white',
        }}
      >
        <p>Chargement...</p>
      </div>
    )
  }

  if (userRole && !canUploadProof(userRole)) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0a0e27',
          color: 'white',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: 24, marginBottom: 16 }}>Accès refusé</h1>
          <p style={{ color: '#94a3b8', marginBottom: 16 }}>
            Cette action nécessite le rôle ops ou admin.
          </p>
          <Link to="/dashboard" style={{ color: '#60a5fa', textDecoration: 'none' }}>
            Retour au dashboard
          </Link>
        </div>
      </div>
    )
  }

  if (error && !execution) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0a0e27',
          color: 'white',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <p style={{ marginBottom: 16 }}>{error}</p>
          <Link to="/dashboard" style={{ color: '#60a5fa', textDecoration: 'none' }}>
            Retour au dashboard
          </Link>
        </div>
      </div>
    )
  }

  const task = execution ? getTaskById(execution.taskId) : null

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0a0e27',
        color: 'white',
        padding: '48px 24px',
      }}
    >
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <Link
          to={`/tasks/${execution?.taskId || ''}`}
          style={{
            display: 'inline-block',
            color: '#94a3b8',
            textDecoration: 'none',
            marginBottom: 32,
            fontSize: 14,
          }}
        >
          ← Retour
        </Link>

        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 32, margin: 0, marginBottom: 8 }}>Preuve requise</h1>
          <p style={{ fontSize: 16, color: '#94a3b8', margin: 0 }}>
            {task?.name || 'Tâche'}
          </p>
        </div>

        <div
          style={{
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: 12,
            padding: 32,
            marginBottom: 24,
          }}
        >
          <p style={{ fontSize: 14, color: '#94a3b8', margin: 0, marginBottom: 24 }}>
            Cette tâche nécessite une preuve d'exécution pour être considérée comme
            terminée. Téléchargez un fichier (image ou document) qui prouve l'exécution.
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 24 }}>
              <label
                style={{
                  display: 'block',
                  fontSize: 13,
                  marginBottom: 8,
                  color: '#e2e8f0',
                }}
              >
                Fichier de preuve
              </label>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                required
                style={{
                  width: '100%',
                  padding: 12,
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: 6,
                  color: 'white',
                  fontSize: 13,
                }}
              />
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 8 }}>
                Formats acceptés : Images (JPG, PNG, etc.) ou PDF. Taille max : 10MB
              </div>
            </div>

            {error && (
              <div
                style={{
                  marginBottom: 24,
                  padding: 12,
                  backgroundColor: '#7f1d1d',
                  borderRadius: 6,
                  color: '#fca5a5',
                  fontSize: 13,
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!file || uploading}
              style={{
                width: '100%',
                padding: '16px 24px',
                fontSize: 16,
                fontWeight: 600,
                backgroundColor: uploading ? '#475569' : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                cursor: !file || uploading ? 'not-allowed' : 'pointer',
                opacity: !file || uploading ? 0.6 : 1,
              }}
            >
              {uploading ? 'Upload en cours...' : 'Soumettre la preuve'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
