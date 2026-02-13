import { Link, useParams } from 'react-router-dom'
import { getTaskById } from '../models/task'

export default function AirbnbInstructions() {
  const { taskId } = useParams<{ taskId: string }>()
  const task = taskId ? getTaskById(taskId) : null

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        color: 'white',
        padding: '24px 16px',
      }}
    >
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <h1 style={{ fontSize: 28, marginBottom: 8, textAlign: 'center' }}>
          {task?.name || 'Instructions'}
        </h1>
        <p style={{ fontSize: 16, color: '#94a3b8', marginBottom: 32, textAlign: 'center' }}>
          {task?.description || 'Capture photo horodatée'}
        </p>

        <div
          style={{
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: 12,
            padding: 24,
            marginBottom: 24,
          }}
        >
          <h2 style={{ fontSize: 20, marginBottom: 16 }}>Instructions</h2>
          <ol style={{ paddingLeft: 20, margin: 0, lineHeight: 1.8 }}>
            <li style={{ marginBottom: 12 }}>
              <strong>Autorisez l'accès à la caméra</strong> lorsque demandé
            </li>
            <li style={{ marginBottom: 12 }}>
              <strong>Cadrez la photo</strong> pour montrer le bien ou l'état des lieux
            </li>
            <li style={{ marginBottom: 12 }}>
              <strong>Capturer la photo</strong> - l'horodatage sera ajouté automatiquement
            </li>
            <li style={{ marginBottom: 12 }}>
              <strong>Vérifiez la photo</strong> avant validation
            </li>
            <li>
              <strong>Validez</strong> pour générer le document final
            </li>
          </ol>
        </div>

        <div
          style={{
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: 12,
            padding: 20,
            marginBottom: 24,
          }}
        >
          <h3 style={{ fontSize: 16, marginBottom: 12 }}>Important</h3>
          <ul style={{ paddingLeft: 20, margin: 0, lineHeight: 1.8, fontSize: 14, color: '#e2e8f0' }}>
            <li>La photo sera horodatée automatiquement</li>
            <li>La photo sert de preuve d'exécution</li>
            <li>Un document PDF sera généré avec la photo</li>
            <li>Vous pourrez télécharger le document final</li>
          </ul>
        </div>

        {taskId && (
          <Link
            to={`/tasks/airbnb/capture/${taskId}`}
            style={{
              display: 'block',
              width: '100%',
              padding: '16px',
              backgroundColor: '#3b82f6',
              borderRadius: 8,
              color: 'white',
              textDecoration: 'none',
              fontSize: 16,
              fontWeight: 600,
              textAlign: 'center',
            }}
          >
            Commencer la capture
          </Link>
        )}
      </div>
    </div>
  )
}
