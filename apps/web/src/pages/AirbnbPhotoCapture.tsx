import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
const API_KEY = import.meta.env.VITE_API_KEY || ''

export default function AirbnbPhotoCapture() {
  const { taskId } = useParams<{ taskId: string }>()
  const navigate = useNavigate()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [photo, setPhoto] = useState<string | null>(null)
  const [capturing, setCapturing] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    startCamera()
    return () => {
      stopCamera()
    }
  }, [])

  async function startCamera() {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, // Caméra arrière sur mobile
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (err) {
      setError('Impossible d\'accéder à la caméra. Vérifiez les permissions.')
      console.error('Erreur caméra:', err)
    }
  }

  function stopCamera() {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
  }

  function capturePhoto() {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    if (!ctx) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0)

    // Ajouter horodatage sur la photo
    const now = new Date()
    const timestamp = now.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
    ctx.fillRect(0, canvas.height - 40, canvas.width, 40)
    ctx.fillStyle = 'white'
    ctx.font = '16px Arial'
    ctx.textAlign = 'left'
    ctx.fillText(`SnapTask • ${timestamp}`, 10, canvas.height - 15)

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
    setPhoto(dataUrl)
    stopCamera()
  }

  async function uploadPhoto() {
    if (!photo || !taskId) return

    setUploading(true)
    setError(null)

    try {
      // Convertir dataUrl en Blob
      const response = await fetch(photo)
      const blob = await response.blob()
      const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' })

      // Créer une exécution de tâche d'abord
      // Pour les tâches Airbnb, utiliser le même pattern que les lettres
      const executionRes = await fetch(`${API_BASE_URL}/v4/tasks/${taskId}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
        },
        body: JSON.stringify({
          context: `Photo horodatée capturée le ${new Date().toLocaleString('fr-FR')}`,
        }),
      })

      if (!executionRes.ok) {
        const errorData = await executionRes.json()
        throw new Error(errorData.error || 'Erreur lors de la création de l\'exécution')
      }

      const executionData = await executionRes.json()
      const executionId = executionData.executionId

      // Upload de la photo comme preuve
      const formData = new FormData()
      formData.append('file', file)

      const uploadRes = await fetch(`${API_BASE_URL}/v4/tasks/${executionId}/proof/upload`, {
        method: 'POST',
        headers: {
          'x-api-key': API_KEY,
        },
        body: formData,
      })

      if (!uploadRes.ok) {
        const errorData = await uploadRes.json()
        throw new Error(errorData.error || 'Erreur upload')
      }

      // Rediriger vers le résultat
      navigate(`/tasks/airbnb/result/${executionId}`)
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'upload')
    } finally {
      setUploading(false)
    }
  }

  function retakePhoto() {
    setPhoto(null)
    startCamera()
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        color: 'white',
        padding: '16px',
      }}
    >
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <h1 style={{ fontSize: 24, marginBottom: 8, textAlign: 'center' }}>
          Capture photo
        </h1>
        <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 24, textAlign: 'center' }}>
          Photo horodatée comme preuve d'exécution
        </p>

        {error && (
          <div
            style={{
              padding: 12,
              backgroundColor: '#7f1d1d',
              borderRadius: 8,
              color: '#fca5a5',
              fontSize: 14,
              marginBottom: 24,
            }}
          >
            {error}
          </div>
        )}

        {!photo ? (
          <div>
            <div
              style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '4/3',
                backgroundColor: '#1e293b',
                borderRadius: 12,
                overflow: 'hidden',
                marginBottom: 24,
              }}
            >
              <video
                ref={videoRef}
                autoPlay
                playsInline
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
              <canvas ref={canvasRef} style={{ display: 'none' }} />
            </div>

            <button
              onClick={capturePhoto}
              disabled={capturing || !stream}
              style={{
                width: '100%',
                padding: '16px',
                backgroundColor: '#3b82f6',
                border: 'none',
                borderRadius: 8,
                color: 'white',
                fontSize: 16,
                fontWeight: 600,
                cursor: capturing || !stream ? 'not-allowed' : 'pointer',
                opacity: capturing || !stream ? 0.5 : 1,
              }}
            >
              {capturing ? 'Capture...' : 'Capturer la photo'}
            </button>
          </div>
        ) : (
          <div>
            <div
              style={{
                width: '100%',
                borderRadius: 12,
                overflow: 'hidden',
                marginBottom: 24,
              }}
            >
              <img
                src={photo}
                alt="Photo capturée"
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button
                onClick={uploadPhoto}
                disabled={uploading}
                style={{
                  width: '100%',
                  padding: '16px',
                  backgroundColor: '#10b981',
                  border: 'none',
                  borderRadius: 8,
                  color: 'white',
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: uploading ? 'not-allowed' : 'pointer',
                  opacity: uploading ? 0.5 : 1,
                }}
              >
                {uploading ? 'Envoi...' : 'Valider et envoyer'}
              </button>
              <button
                onClick={retakePhoto}
                disabled={uploading}
                style={{
                  width: '100%',
                  padding: '16px',
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: 8,
                  color: 'white',
                  fontSize: 16,
                  fontWeight: 500,
                  cursor: uploading ? 'not-allowed' : 'pointer',
                  opacity: uploading ? 0.5 : 1,
                }}
              >
                Reprendre la photo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
