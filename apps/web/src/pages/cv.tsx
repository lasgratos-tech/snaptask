import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function CvPage() {
  const navigate = useNavigate()
  const [profileText, setProfileText] = useState('')
  const [targetRole, setTargetRole] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    localStorage.setItem('cv_payload', JSON.stringify({ profileText, targetRole }))
    navigate('/cv/processing')
  }

  return (
    <div style={{ padding: 24 }}>
      <img src="/figma/cv-form.png" alt="CV Form" style={{ maxWidth: '100%', marginBottom: 24 }} />
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 8 }}>Profil</label>
          <textarea
            value={profileText}
            onChange={(e) => setProfileText(e.target.value)}
            style={{ width: '100%', minHeight: 200, padding: 8 }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 8 }}>Rôle cible</label>
          <input
            type="text"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            style={{ width: '100%', padding: 8 }}
          />
        </div>
        <button type="submit">Générer CV</button>
      </form>
    </div>
  )
}
