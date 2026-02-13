import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
const API_KEY = import.meta.env.VITE_API_KEY

export default function CvProcessingPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const payloadStr = localStorage.getItem('cv_payload')
    if (!payloadStr) {
      navigate('/cv')
      return
    }

    const payload = JSON.parse(payloadStr)
    const { profileText, targetRole } = payload

    async function generateCv() {
      try {
        const res = await fetch(`${API_BASE_URL}/v4/cv/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_KEY || '',
          },
          body: JSON.stringify({
            profileText,
            targetRole,
            language: 'fr',
          }),
        })

        const data = await res.json()
        if (!res.ok) {
          throw new Error(data.error || 'Erreur API')
        }

        localStorage.setItem('cv_result', JSON.stringify(data))
        navigate('/cv/result')
      } catch (error) {
        console.error('Erreur génération CV:', error)
        navigate('/cv')
      }
    }

    generateCv()
  }, [navigate])

  return (
    <div style={{ padding: 24 }}>
      <img src="/figma/cv-processing.png" alt="CV Processing" style={{ maxWidth: '100%' }} />
    </div>
  )
}
