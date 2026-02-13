import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function CvProcessingPage() {
  const navigate = useNavigate()

  useEffect(() => {
    // Vérifier si le résultat existe déjà (l'API a répondu rapidement)
    const result = sessionStorage.getItem('cvResult')
    if (result) {
      // Rediriger immédiatement vers le résultat
      navigate('/cv/result')
      return
    }

    // Sinon, simuler un traitement de 2 secondes puis rediriger vers le résultat
    const timer = setTimeout(() => {
      navigate('/cv/result')
    }, 2000)

    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: 24,
      }}
    >
      <h1>Traitement en cours...</h1>
      <div
        style={{
          width: 50,
          height: 50,
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #007bff',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }}
      />
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <p style={{ marginTop: 24 }}>Génération de votre CV professionnel...</p>
    </div>
  )
}
