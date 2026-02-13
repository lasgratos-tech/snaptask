import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Profile() {
  const { user, logout } = useAuth()

  async function handleLogout() {
    await logout()
    window.location.href = '/'
  }

  if (!user) {
    return null
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
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <h1 style={{ fontSize: 32, margin: 0, marginBottom: 8 }}>Profil</h1>
              <p style={{ fontSize: 16, color: '#94a3b8', margin: 0 }}>
                Informations de votre compte
              </p>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <Link
                to="/catalogue"
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
                to="/my-tasks"
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
                Mes tâches
              </Link>
            </div>
          </div>
        </div>

        <div
          style={{
            padding: 24,
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: 8,
            marginBottom: 24,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4, textTransform: 'uppercase' }}>
                Identifiant
              </div>
              <div style={{ fontSize: 16 }}>{user.id}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4, textTransform: 'uppercase' }}>
                Email
              </div>
              <div style={{ fontSize: 16 }}>{user.owner}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4, textTransform: 'uppercase' }}>
                Rôle
              </div>
              <div style={{ fontSize: 16 }}>{user.role}</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Link
            to="/catalogue"
            style={{
              display: 'block',
              padding: '12px 24px',
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: 8,
              color: 'white',
              textDecoration: 'none',
              textAlign: 'center',
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            Retour au catalogue
          </Link>
          <button
            onClick={handleLogout}
            style={{
              padding: '12px 24px',
              backgroundColor: '#7f1d1d',
              border: '1px solid #991b1b',
              borderRadius: 8,
              color: '#fca5a5',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Déconnexion
          </button>
        </div>
      </div>
    </div>
  )
}
