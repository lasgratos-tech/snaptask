import { Link } from 'react-router-dom'
import { TASK_CATEGORIES, TASK_DEFINITIONS } from '../models/task'
import { useUserRole } from '../hooks/useUserRole'
import { canAccessAdminPanel, canAccessAudit } from '../models/user'

export default function Admin() {
  const userRole = useUserRole()

  if (userRole && !canAccessAdminPanel(userRole)) {
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
            Cette page nécessite le rôle admin.
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
          <h1 style={{ fontSize: 32, margin: 0, marginBottom: 8 }}>Admin SnapTask</h1>
          <p style={{ fontSize: 16, color: '#94a3b8', margin: 0 }}>
            Gestion du catalogue de tâches
          </p>
          <div style={{ marginTop: 16, display: 'flex', gap: 16 }}>
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
              Catalogue
            </Link>
            <Link
              to="/admin/executions"
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
              Exécutions
            </Link>
            <Link
              to="/admin/catalogue"
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
              Catalogue
            </Link>
            <Link
              to="/admin/proofs"
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
              Preuves
            </Link>
            {(userRole === 'admin' || userRole === 'reviewer') && (
              <Link
                to="/admin/validation"
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
                Validation
              </Link>
            )}
            {(userRole === 'admin' || userRole === 'reviewer') && (
              <Link
                to="/admin/audit"
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
                Audit
              </Link>
            )}
            {(userRole === 'admin' || userRole === 'reviewer') && (
              <Link
                to="/admin/compliance-finance"
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
                Conformité & Finance
              </Link>
            )}
            {(userRole === 'admin' || userRole === 'reviewer') && (
              <Link
                to="/admin/disputes"
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
                Litiges
              </Link>
            )}
            {userRole === 'admin' && (
              <Link
                to="/admin/pricing"
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
                Pricing
              </Link>
            )}
          </div>
        </div>

        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 20, margin: 0, marginBottom: 24 }}>Catégories</h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: 16,
            }}
          >
            {TASK_CATEGORIES.map((category) => {
              const taskCount = TASK_DEFINITIONS.filter(
                (t) => t.categoryId === category.id
              ).length
              return (
                <div
                  key={category.id}
                  style={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: 8,
                    padding: 20,
                  }}
                >
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                    {category.name}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>
                    {category.description}
                  </div>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>
                    {taskCount} tâche{taskCount > 1 ? 's' : ''}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div>
          <h2 style={{ fontSize: 20, margin: 0, marginBottom: 24 }}>Tâches</h2>
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
                    Nom
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
                    Catégorie
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
                    Livrable
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
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody>
                {TASK_DEFINITIONS.map((task, index) => (
                  <tr
                    key={task.id}
                    style={{
                      borderBottom: index < TASK_DEFINITIONS.length - 1 ? '1px solid #334155' : 'none',
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
                      {task.id}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 14 }}>
                      {task.name}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: '#94a3b8' }}>
                      {TASK_CATEGORIES.find((c) => c.id === task.categoryId)?.name}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: '#94a3b8' }}>
                      {task.deliverableType}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13 }}>
                      {task.requiresProof ? (
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
                          {task.proofType}
                        </span>
                      ) : (
                        <span style={{ color: '#64748b' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13 }}>
                      {task.active ? (
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '4px 8px',
                            borderRadius: 4,
                            backgroundColor: '#064e3b',
                            color: '#6ee7b7',
                            fontSize: 11,
                            fontWeight: 500,
                          }}
                        >
                          Active
                        </span>
                      ) : (
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '4px 8px',
                            borderRadius: 4,
                            backgroundColor: '#7f1d1d',
                            color: '#fca5a5',
                            fontSize: 11,
                            fontWeight: 500,
                          }}
                        >
                          Inactive
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
