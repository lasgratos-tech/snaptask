import { useState } from 'react'
import { runCvInstantTask } from '../api/tasks'

export default function PlaygroundCvInstant() {
  const [apiKey, setApiKey] = useState('')
  const [targetRole, setTargetRole] = useState('Product Manager')
  const [language, setLanguage] = useState<'fr' | 'en'>('fr')
  const [style, setStyle] = useState<'classic' | 'modern' | 'executive'>(
    'executive',
  )
  const [includeCoverLetter, setIncludeCoverLetter] = useState(true)
  const [image, setImage] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleFileChange(file: File | null) {
    if (!file) {
      setImage('')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = String(reader.result ?? '')
      setImage(dataUrl)
    }
    reader.readAsDataURL(file)
  }

  async function handleSubmit() {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      if (!apiKey) {
        throw new Error('API key requise')
      }
      if (!image) {
        throw new Error('Image requise')
      }

      const data = await runCvInstantTask({
        apiKey,
        image,
        targetRole,
        language,
        style,
        includeCoverLetter,
      })

      setResult(data)
    } catch (err: any) {
      setError(err.message ?? 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <h1>Playground — CV Instant</h1>

      <label>API Key</label>
      <input
        style={{ width: '100%', marginBottom: 12 }}
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        placeholder="sk_test_..."
      />

      <label>Photo (image unique)</label>
      <input
        style={{ width: '100%', marginBottom: 12 }}
        type="file"
        accept="image/*"
        onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
      />

      <label>Target role</label>
      <input
        style={{ width: '100%', marginBottom: 12 }}
        value={targetRole}
        onChange={(e) => setTargetRole(e.target.value)}
        placeholder="Ex: Chef de produit"
      />

      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        <select value={language} onChange={(e) => setLanguage(e.target.value as 'fr' | 'en')}>
          <option value="fr">FR</option>
          <option value="en">EN</option>
        </select>
        <select
          value={style}
          onChange={(e) =>
            setStyle(e.target.value as 'classic' | 'modern' | 'executive')
          }
        >
          <option value="classic">Classic</option>
          <option value="modern">Modern</option>
          <option value="executive">Executive</option>
        </select>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <input
            type="checkbox"
            checked={includeCoverLetter}
            onChange={(e) => setIncludeCoverLetter(e.target.checked)}
          />
          Lettre de motivation
        </label>
      </div>

      <button onClick={handleSubmit} disabled={loading}>
        {loading ? 'Génération...' : 'Generate CV'}
      </button>

      {error && (
        <pre style={{ color: 'red', marginTop: 16 }}>{error}</pre>
      )}

      {result && (
        <pre style={{ marginTop: 16, background: '#f4f4f4', padding: 12 }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  )
}
