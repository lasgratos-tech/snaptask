import React from 'react'
import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#ffffff',
        color: '#111827',
      }}
    >
      {/* Header — aligné référence */}
      <header
        style={{
          padding: '24px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: 1200,
          margin: '0 auto',
        }}
      >
        <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: '0.02em' }}>
          SNAPTASK
        </span>
        <nav style={{ display: 'flex', gap: 24, alignItems: 'center', fontSize: 14, color: '#374151' }}>
          <a href="#demo" style={{ color: 'inherit', textDecoration: 'none' }}>Produit</a>
          <a href="#comment" style={{ color: 'inherit', textDecoration: 'none' }}>Comment ça marche</a>
          <a href="#mobile" style={{ color: 'inherit', textDecoration: 'none' }}>Application</a>
          <Link to="/login" style={{ color: 'inherit', textDecoration: 'none' }}>Connexion</Link>
          <span style={{ color: '#9ca3af' }}>FR</span>
        </nav>
      </header>

      {/* Hero */}
      <section
        style={{
          padding: '80px 24px',
          textAlign: 'center',
          maxWidth: 800,
          margin: '0 auto',
        }}
      >
        <h1
          style={{
            fontSize: 48,
            marginBottom: 24,
            fontWeight: 700,
            lineHeight: 1.2,
            color: '#111827',
            letterSpacing: '0.02em',
          }}
        >
          SNAPTASK APP
        </h1>
        <p
          style={{
            fontSize: 20,
            color: '#111827',
            marginBottom: 24,
            lineHeight: 1.6,
          }}
        >
          Des documents professionnels livrés, sans perte de temps.
        </p>
        <p
          style={{
            fontSize: 16,
            color: '#374151',
            marginBottom: 32,
            lineHeight: 1.6,
          }}
        >
          SnapTask exécute des tâches précises et livre des résultats prêts à l'emploi, avec preuve et audit.
        </p>
        <div
          style={{
            padding: '24px 32px',
            backgroundColor: '#f3f4f6',
            borderRadius: 12,
            marginBottom: 40,
            textAlign: 'center',
          }}
        >
          <p style={{ fontSize: 16, lineHeight: 1.8, color: '#111827', margin: 0 }}>
            Aucune génération libre. Aucun chatbot.<br />
            Uniquement des livrables exploitables.<br />
            Pensé pour les professionnels qui veulent un résultat, pas une démo.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            to="/catalogue"
            style={{
              padding: '16px 32px',
              backgroundColor: '#2563eb',
              borderRadius: 8,
              color: '#fff',
              textDecoration: 'none',
              fontSize: 16,
              fontWeight: 600,
            }}
          >
            Lancer une tâche
          </Link>
          <Link
            to="/register"
            style={{
              padding: '16px 32px',
              backgroundColor: '#374151',
              borderRadius: 8,
              color: '#fff',
              textDecoration: 'none',
              fontSize: 16,
              fontWeight: 500,
            }}
          >
            Créer un compte
          </Link>
        </div>
      </section>

      {/* Démonstration par le résultat */}
      <section
        id="demo"
        style={{
          padding: '80px 24px',
          backgroundColor: '#f9fafb',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h2
            style={{
              fontSize: 32,
              marginBottom: 48,
              textAlign: 'center',
              fontWeight: 700,
              color: '#111827',
            }}
          >
            Démonstration par le résultat
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 32,
            }}
          >
            <div
              style={{
                backgroundColor: '#fff',
                borderRadius: 12,
                border: '1px solid #e5e7eb',
                overflow: 'hidden',
              }}
            >
              <div style={{ height: 160, backgroundColor: '#e5e7eb' }} />
              <div style={{ padding: 24 }}>
                <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12, color: '#111827' }}>
                  CV professionnel
                </h3>
                <p style={{ fontSize: 14, color: '#374151', margin: '4px 0' }}>Action : Générer un CV</p>
                <p style={{ fontSize: 14, color: '#374151', margin: '4px 0' }}>Livrable : PDF final exploitable</p>
              </div>
            </div>
            <div
              style={{
                backgroundColor: '#fff',
                borderRadius: 12,
                border: '1px solid #e5e7eb',
                overflow: 'hidden',
              }}
            >
              <div style={{ height: 160, backgroundColor: '#e5e7eb' }} />
              <div style={{ padding: 24 }}>
                <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12, color: '#111827' }}>
                  Documents Airbnb
                </h3>
                <p style={{ fontSize: 14, color: '#374151', margin: '4px 0' }}>Action : Créer une annonce</p>
                <p style={{ fontSize: 14, color: '#374151', margin: '4px 0' }}>Livrable : Prêts à l'usage immédiat</p>
              </div>
            </div>
            <div
              style={{
                backgroundColor: '#fff',
                borderRadius: 12,
                border: '1px solid #e5e7eb',
                overflow: 'hidden',
              }}
            >
              <div style={{ height: 160, backgroundColor: '#e5e7eb' }} />
              <div style={{ padding: 24 }}>
                <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12, color: '#111827' }}>
                  Lettres professionnelles
                </h3>
                <p style={{ fontSize: 14, color: '#374151', margin: '4px 0' }}>Action : Rédiger une lettre</p>
                <p style={{ fontSize: 14, color: '#374151', margin: '4px 0' }}>Livrable : Exploitable immédiatement</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section
        id="comment"
        style={{
          padding: '80px 24px',
          backgroundColor: '#ffffff',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h2
            style={{
              fontSize: 32,
              marginBottom: 48,
              textAlign: 'center',
              fontWeight: 700,
              color: '#111827',
            }}
          >
            Comment ça marche
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 32,
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  backgroundColor: '#374151',
                  margin: '0 auto 16px',
                }}
              />
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: '#111827' }}>
                1. Choisir une tâche
              </h3>
              <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.6 }}>
                Sélectionnez le type de document ou de tâche à exécuter
              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  backgroundColor: '#374151',
                  margin: '0 auto 16px',
                }}
              />
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: '#111827' }}>
                2. Exécution contrôlée
              </h3>
              <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.6 }}>
                SnapTask traite votre demande avec précision et contrôle
              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  backgroundColor: '#374151',
                  margin: '0 auto 16px',
                }}
              />
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: '#111827' }}>
                3. Livrable + preuve
              </h3>
              <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.6 }}>
                Recevez votre résultat final avec audit et traçabilité
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile */}
      <section
        id="mobile"
        style={{
          padding: '80px 24px',
          backgroundColor: '#f9fafb',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2
            style={{
              fontSize: 32,
              marginBottom: 16,
              fontWeight: 700,
              color: '#111827',
            }}
          >
            SnapTask aussi disponible sur mobile
          </h2>
          <p style={{ fontSize: 16, color: '#374151', marginBottom: 32, lineHeight: 1.6 }}>
            Accédez à vos tâches et livrables où que vous soyez
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <span
              style={{
                padding: '14px 24px',
                backgroundColor: '#111827',
                borderRadius: 8,
                color: '#fff',
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              Télécharger sur App Store
            </span>
            <span
              style={{
                padding: '14px 24px',
                backgroundColor: '#111827',
                borderRadius: 8,
                color: '#fff',
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              Disponible sur Google Play
            </span>
          </div>
        </div>
      </section>

      {/* Standards */}
      <section
        style={{
          padding: '80px 24px',
          backgroundColor: '#ffffff',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h2
            style={{
              fontSize: 32,
              marginBottom: 16,
              fontWeight: 700,
              color: '#111827',
            }}
          >
            Un standard inspiré des meilleurs
          </h2>
          <p style={{ fontSize: 16, color: '#374151', marginBottom: 40, lineHeight: 1.6 }}>
            SnapTask s'inspire des standards professionnels de ces plateformes, sans les copier, pour livrer des résultats fiables et auditables.
          </p>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 48,
              flexWrap: 'wrap',
              fontSize: 18,
              color: '#9ca3af',
              fontWeight: 500,
            }}
          >
            <span>Airbnb</span>
            <span>OpenAI</span>
            <span>Apple</span>
            <span>Google</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          padding: '24px',
          borderTop: '1px solid #e5e7eb',
          textAlign: 'center',
          fontSize: 14,
          color: '#9ca3af',
        }}
      >
        © SnapTask 2026
      </footer>
    </div>
  )
}
