import { Link } from 'react-router-dom'
import { TASK_CATEGORIES, TASK_DEFINITIONS } from '../models/task'
import { ProofType } from '../models/proof'

export default function Catalogue() {
  const getTasksByCategory = (categoryId: string) => {
    return TASK_DEFINITIONS.filter((task) => task.categoryId === categoryId && task.active)
  }

  const getProofTypeLabel = (proofType: ProofType) => {
    switch (proofType) {
      case ProofType.NONE:
        return 'Aucune preuve requise'
      case ProofType.FILE:
        return 'Preuve par fichier'
      case ProofType.HUMAN_VALIDATION:
        return 'Validation humaine'
      default:
        return ''
    }
  }

  const getDeliverableTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      cv: 'CV',
      letter: 'Lettre',
      analysis: 'Analyse',
      document: 'Document',
      report: 'Rapport',
      checklist: 'Checklist',
    }
    return labels[type] || type
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
        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div>
              <h1 style={{ fontSize: 40, margin: 0, marginBottom: 12, fontWeight: 700 }}>
                Catalogue SnapTask
              </h1>
              <p style={{ fontSize: 18, color: '#94a3b8', margin: 0, maxWidth: 600 }}>
                Marketplace d'actions IA. Choisissez une tâche, SnapTask génère le livrable.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <Link
                to="/my-tasks"
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: 6,
                  color: 'white',
                  textDecoration: 'none',
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                Mes tâches
              </Link>
              <Link
                to="/profile"
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: 6,
                  color: 'white',
                  textDecoration: 'none',
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                Profil
              </Link>
            </div>
          </div>
        </div>

        {/* Navigation rapide */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: '#94a3b8' }}>
            Navigation rapide
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {TASK_CATEGORIES.map((category) => {
              const tasks = getTasksByCategory(category.id)
              if (tasks.length === 0) return null
              return (
                <a
                  key={category.id}
                  href={`#${category.id}`}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: 6,
                    color: '#e2e8f0',
                    textDecoration: 'none',
                    fontSize: 14,
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#334155'
                    e.currentTarget.style.borderColor = '#475569'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#1e293b'
                    e.currentTarget.style.borderColor = '#334155'
                  }}
                >
                  {category.name}
                </a>
              )
            })}
          </div>
        </div>

        {/* Sections par catégorie */}
        {TASK_CATEGORIES.map((category) => {
          const tasks = getTasksByCategory(category.id)
          if (tasks.length === 0) return null

          return (
            <section
              key={category.id}
              id={category.id}
              style={{ marginBottom: 64, scrollMarginTop: 80 }}
            >
              {/* En-tête de section */}
              <div style={{ marginBottom: 24 }}>
                <h2
                  style={{
                    fontSize: 28,
                    margin: 0,
                    marginBottom: 8,
                    fontWeight: 600,
                  }}
                >
                  {category.name}
                </h2>
                <p style={{ fontSize: 16, color: '#94a3b8', margin: 0 }}>
                  {category.description}
                </p>
              </div>

              {/* Cards de tâches */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: 24,
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
                      borderRadius: 12,
                      padding: 24,
                      textDecoration: 'none',
                      color: 'inherit',
                      transition: 'all 0.2s',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#334155'
                      e.currentTarget.style.borderColor = '#475569'
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.3)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#1e293b'
                      e.currentTarget.style.borderColor = '#334155'
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    {/* Header de la card */}
                    <div style={{ marginBottom: 16 }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: 8,
                        }}
                      >
                        <h3
                          style={{
                            fontSize: 20,
                            margin: 0,
                            fontWeight: 600,
                            color: '#f1f5f9',
                          }}
                        >
                          {task.name}
                        </h3>
                        {task.price && (
                          <div
                            style={{
                              padding: '4px 12px',
                              backgroundColor: '#0f172a',
                              borderRadius: 6,
                              fontSize: 14,
                              fontWeight: 600,
                              color: '#3b82f6',
                            }}
                          >
                            {task.price.amount} {task.price.currency}
                          </div>
                        )}
                      </div>
                      <p
                        style={{
                          fontSize: 14,
                          color: '#94a3b8',
                          margin: 0,
                          lineHeight: 1.5,
                        }}
                      >
                        {task.description}
                      </p>
                    </div>

                    {/* Livrable */}
                    <div
                      style={{
                        padding: 12,
                        backgroundColor: '#0f172a',
                        borderRadius: 8,
                        marginBottom: 12,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 12,
                          color: '#64748b',
                          marginBottom: 4,
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}
                      >
                        Livrable
                      </div>
                      <div style={{ fontSize: 14, color: '#e2e8f0', fontWeight: 500 }}>
                        {getDeliverableTypeLabel(task.deliverableType)}
                      </div>
                      <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>
                        {task.deliverableDescription}
                      </div>
                    </div>

                    {/* Preuve requise */}
                    {task.requiresProof && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '8px 12px',
                          backgroundColor: '#0f172a',
                          borderRadius: 6,
                          fontSize: 13,
                          color: '#94a3b8',
                        }}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          style={{ flexShrink: 0 }}
                        >
                          <path
                            d="M8 1C4.134 1 1 4.134 1 8s3.134 7 7 7 7-3.134 7-7-3.134-7-7-7zm0 12.5c-3.032 0-5.5-2.468-5.5-5.5S4.968 2.5 8 2.5 13.5 4.968 13.5 8 11.032 13.5 8 13.5z"
                            fill="currentColor"
                          />
                          <path
                            d="M8 4.5c-.276 0-.5.224-.5.5v3c0 .276.224.5.5.5s.5-.224.5-.5V5c0-.276-.224-.5-.5-.5zm0 6c-.276 0-.5.224-.5.5s.224.5.5.5.5-.224.5-.5-.224-.5-.5-.5z"
                            fill="currentColor"
                          />
                        </svg>
                        {getProofTypeLabel(task.proofType)}
                      </div>
                    )}

                    {/* Badge "Aucune preuve" */}
                    {!task.requiresProof && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '8px 12px',
                          backgroundColor: '#0f172a',
                          borderRadius: 6,
                          fontSize: 13,
                          color: '#64748b',
                        }}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          style={{ flexShrink: 0 }}
                        >
                          <path
                            d="M8 1C4.134 1 1 4.134 1 8s3.134 7 7 7 7-3.134 7-7-3.134-7-7-7zm3.354 5.646a.5.5 0 00-.708-.708L8 7.293 5.354 4.646a.5.5 0 10-.708.708L7.293 8l-2.647 2.646a.5.5 0 00.708.708L8 8.707l2.646 2.647a.5.5 0 00.708-.708L8.707 8l2.647-2.354z"
                            fill="currentColor"
                          />
                        </svg>
                        Aucune preuve requise
                      </div>
                    )}

                    {/* CTA */}
                    <div
                      style={{
                        marginTop: 16,
                        paddingTop: 16,
                        borderTop: '1px solid #334155',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span
                        style={{
                          fontSize: 14,
                          color: '#3b82f6',
                          fontWeight: 500,
                        }}
                      >
                        Commencer →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )
        })}

        {/* Footer */}
        <div
          style={{
            marginTop: 80,
            paddingTop: 32,
            borderTop: '1px solid #334155',
            textAlign: 'center',
            color: '#64748b',
            fontSize: 14,
          }}
        >
          <p style={{ margin: 0 }}>
            SnapTask — Marketplace d'actions IA avec preuve d'exécution
          </p>
        </div>
      </div>
    </div>
  )
}
