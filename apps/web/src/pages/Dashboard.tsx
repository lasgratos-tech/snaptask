import { Link } from 'react-router-dom'
import { TASK_CATEGORIES, getTasksByCategory } from '../models/task'

export default function Dashboard() {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0a0e27',
        color: 'white',
        padding: '48px 24px',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ marginBottom: 48 }}>
          <h1 style={{ fontSize: 32, margin: 0, marginBottom: 8 }}>SnapTask</h1>
          <p style={{ fontSize: 16, color: '#94a3b8', margin: 0 }}>
            Marketplace d'actions IA. Choisis une tâche, SnapTask exécute.
          </p>
        </div>

        {TASK_CATEGORIES.map((category) => {
          const tasks = getTasksByCategory(category.id)
          if (tasks.length === 0) return null

          return (
            <div key={category.id} style={{ marginBottom: 48 }}>
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 20, margin: 0, marginBottom: 8 }}>
                  {category.name}
                </h2>
                <p style={{ fontSize: 14, color: '#64748b', margin: 0 }}>
                  {category.description}
                </p>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: 20,
                }}
              >
                {tasks.map((task) => (
                  <Link
                    key={task.id}
                    to={task.route}
                    style={{
                      display: 'block',
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: 8,
                      padding: 20,
                      textDecoration: 'none',
                      color: 'inherit',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#475569'
                      e.currentTarget.style.transform = 'translateY(-2px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#334155'
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}
                  >
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
                    <h3 style={{ fontSize: 18, margin: 0, marginBottom: 8 }}>
                      {task.name}
                    </h3>
                    <p
                      style={{
                        fontSize: 14,
                        color: '#94a3b8',
                        margin: 0,
                        marginBottom: 12,
                        lineHeight: 1.5,
                      }}
                    >
                      {task.description}
                    </p>
                    <div
                      style={{
                        fontSize: 12,
                        color: '#10b981',
                        fontWeight: 500,
                      }}
                    >
                      ✓ Résultat prêt à l'emploi
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
