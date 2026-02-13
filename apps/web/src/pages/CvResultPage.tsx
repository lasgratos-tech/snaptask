import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function CvResultPage() {
  const navigate = useNavigate()
  const [result, setResult] = useState<any>(null)

  useEffect(() => {
    // Récupérer le résultat depuis sessionStorage
    const storedResult = sessionStorage.getItem('cvResult')
    if (storedResult) {
      try {
        setResult(JSON.parse(storedResult))
      } catch (e) {
        console.error('Erreur lors du parsing du résultat', e)
      }
    } else {
      // Si pas de résultat, rediriger vers la page d'accueil
      navigate('/cv')
    }
  }, [navigate])

  if (!result) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#020617',
          color: 'white',
        }}
      >
        <p>Chargement du résultat...</p>
      </div>
    )
  }

  const cvText =
    (result && (result.cv as string)) ||
    (result && (result.output as string)) ||
    JSON.stringify(result, null, 2)

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#020617',
        padding: 24,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 960,
          backgroundColor: '#0b1120',
          borderRadius: 16,
          border: '1px solid rgba(148, 163, 184, 0.3)',
          boxShadow:
            '0 20px 40px rgba(15, 23, 42, 0.8), 0 0 0 1px rgba(15, 23, 42, 0.9)',
          padding: 24,
          color: 'white',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)',
          gap: 24,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 22,
              margin: 0,
              marginBottom: 8,
            }}
          >
            CV généré
          </h1>
          <p
            style={{
              margin: 0,
              marginBottom: 16,
              fontSize: 13,
              color: '#9ca3af',
            }}
          >
            Copiez/collez ce CV dans votre éditeur préféré ou exportez-le au
            format PDF.
          </p>

          <div
            style={{
              backgroundColor: '#020617',
              borderRadius: 12,
              border: '1px solid #1f2937',
              padding: 16,
              maxHeight: '70vh',
              overflow: 'auto',
            }}
          >
            <pre
              style={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                margin: 0,
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, monospace',
                fontSize: 13,
              }}
            >
              {cvText}
            </pre>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{
              padding: 16,
              borderRadius: 12,
              border: '1px solid rgba(148, 163, 184, 0.4)',
              background:
                'radial-gradient(circle at top, rgba(79, 70, 229, 0.25), transparent 55%)',
            }}
          >
            <h2
              style={{
                fontSize: 16,
                margin: 0,
                marginBottom: 8,
              }}
            >
              Résumé
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: 13,
                color: '#9ca3af',
              }}
            >
              Votre CV a été généré avec succès. Vérifiez le contenu, adaptez les
              intitulés et ajustez les dates si nécessaire avant envoi.
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              marginTop: 24,
            }}
          >
            <button
              onClick={() => {
                sessionStorage.removeItem('cvResult')
                navigate('/cv')
              }}
              style={{
                padding: '10px 16px',
                borderRadius: 999,
                border: 'none',
                backgroundColor: '#111827',
                color: '#e5e7eb',
                cursor: 'pointer',
                fontSize: 13,
              }}
            >
              Générer un nouveau CV
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
