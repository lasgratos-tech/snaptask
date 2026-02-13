import { useParams, useNavigate, Link } from 'react-router-dom'
import { getTaskByRoute } from '../models/task'
import { ProofType, requiresProof } from '../models/proof'

export default function TaskPage() {
  const { '*': route } = useParams<{ '*': string }>()
  const navigate = useNavigate()
  const fullRoute = route ? `/tasks/${route}` : ''
  const task = fullRoute ? getTaskByRoute(fullRoute) : undefined

  if (!task) {
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
          <h1 style={{ fontSize: 24, marginBottom: 16 }}>Tâche non trouvée</h1>
          <Link
            to="/dashboard"
            style={{ color: '#60a5fa', textDecoration: 'none' }}
          >
            Retour au dashboard
          </Link>
        </div>
      </div>
    )
  }

  function handleLaunch() {
    if (task.route === '/tasks/cv/pro') {
      navigate('/cv')
    } else {
      alert(`Tâche "${task.name}" - À implémenter`)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0a0e27',
        color: 'white',
        padding: '48px 24px',
      }}
    >
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <Link
          to="/dashboard"
          style={{
            display: 'inline-block',
            color: '#94a3b8',
            textDecoration: 'none',
            marginBottom: 32,
            fontSize: 14,
          }}
        >
          ← Retour au dashboard
        </Link>

        <div style={{ marginBottom: 32 }}>
          <div
            style={{
              fontSize: 12,
              color: '#64748b',
              marginBottom: 8,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            {task.deliverableType}
          </div>
          <h1 style={{ fontSize: 36, margin: 0, marginBottom: 16 }}>
            {task.name}
          </h1>
          <p style={{ fontSize: 18, color: '#94a3b8', margin: 0, lineHeight: 1.6 }}>
            {task.description}
          </p>
        </div>

        <div
          style={{
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: 12,
            padding: 32,
            marginBottom: 32,
          }}
        >
          <h2
            style={{
              fontSize: 16,
              margin: 0,
              marginBottom: 16,
              color: '#e2e8f0',
            }}
          >
            Ce que tu demandes
          </h2>
          <p style={{ fontSize: 14, color: '#94a3b8', margin: 0, lineHeight: 1.6 }}>
            Tu fournis les informations nécessaires (profil, contexte, documents si
            requis). SnapTask traite ta demande.
          </p>
        </div>

        <div
          style={{
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: 12,
            padding: 32,
            marginBottom: 32,
          }}
        >
          <h2
            style={{
              fontSize: 16,
              margin: 0,
              marginBottom: 16,
              color: '#e2e8f0',
            }}
          >
            Ce que SnapTask livre
          </h2>
          <p style={{ fontSize: 14, color: '#94a3b8', margin: 0, lineHeight: 1.6 }}>
            {task.deliverableDescription}
          </p>
        </div>

        {task.requiresProof && (
          <div
            style={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: 12,
              padding: 32,
              marginBottom: 32,
            }}
          >
            <h2
              style={{
                fontSize: 16,
                margin: 0,
                marginBottom: 16,
                color: '#e2e8f0',
              }}
            >
              Preuve d'exécution requise
            </h2>
            <p style={{ fontSize: 14, color: '#94a3b8', margin: 0, marginBottom: 12 }}>
              Cette tâche nécessite une preuve d'exécution pour être considérée comme
              terminée.
            </p>
            <div
              style={{
                padding: 12,
                backgroundColor: '#1e3a5f',
                borderRadius: 6,
                fontSize: 13,
                color: '#93c5fd',
              }}
            >
              Type de preuve :{' '}
              {task.proofType === ProofType.FILE
                ? 'Fichier (photos, documents)'
                : task.proofType === ProofType.HUMAN_VALIDATION
                  ? 'Validation humaine'
                  : 'Aucune'}
            </div>
          </div>
        )}

        <button
          onClick={handleLaunch}
          style={{
            width: '100%',
            padding: '16px 24px',
            fontSize: 16,
            fontWeight: 600,
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#2563eb'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#3b82f6'
          }}
        >
          Lancer la tâche
        </button>
      </div>
    </div>
  )
}
