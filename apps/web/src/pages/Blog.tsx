import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Blog() {
  const { isAuthenticated } = useAuth()

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        color: 'white',
      }}
    >
      {/* Header */}
      <header
        style={{
          padding: '24px',
          borderBottom: '1px solid #1e293b',
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Link
            to="/"
            style={{
              fontSize: 24,
              margin: 0,
              fontWeight: 700,
              color: 'white',
              textDecoration: 'none',
            }}
          >
            SnapTask
          </Link>
          <nav style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            {isAuthenticated ? (
              <>
                <Link
                  to="/catalogue"
                  style={{
                    color: '#e2e8f0',
                    textDecoration: 'none',
                    fontSize: 14,
                    fontWeight: 500,
                  }}
                >
                  Catalogue
                </Link>
                <Link
                  to="/my-tasks"
                  style={{
                    color: '#e2e8f0',
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
                    color: '#e2e8f0',
                    textDecoration: 'none',
                    fontSize: 14,
                    fontWeight: 500,
                  }}
                >
                  Profil
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  style={{
                    color: '#e2e8f0',
                    textDecoration: 'none',
                    fontSize: 14,
                    fontWeight: 500,
                    padding: '8px 0',
                    display: 'inline-block',
                  }}
                >
                  Connexion
                </Link>
                <Link
                  to="/register"
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#3b82f6',
                    borderRadius: 6,
                    color: 'white',
                    textDecoration: 'none',
                    fontSize: 14,
                    fontWeight: 500,
                  }}
                >
                  Inscription
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Article */}
      <article
        style={{
          padding: '80px 24px',
          maxWidth: 800,
          margin: '0 auto',
        }}
      >
        <h1
          style={{
            fontSize: 36,
            marginBottom: 32,
            fontWeight: 700,
            lineHeight: 1.2,
          }}
        >
          Pourquoi SnapTask n'est pas un chatbot
        </h1>

        <div
          style={{
            fontSize: 16,
            lineHeight: 1.8,
            color: '#e2e8f0',
          }}
        >
          <p style={{ marginBottom: 24 }}>
            Aucune génération libre. Aucun chatbot.
            Uniquement des livrables exploitables.
            Pensé pour les professionnels qui veulent un résultat, pas une démo.
          </p>

          <p style={{ marginBottom: 0 }}>
            SnapTask a été conçu pour exécuter des actions réelles,
            livrer des documents professionnels,
            et fournir une preuve d'exécution vérifiable.
          </p>
        </div>
      </article>
    </div>
  )
}
