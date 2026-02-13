import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CvRenderer } from '../cv/CvRenderer'

export default function CvResultPage() {
  const navigate = useNavigate()
  const [cvText, setCvText] = useState('')
  const [targetRole, setTargetRole] = useState('')

  useEffect(() => {
    const resultStr = localStorage.getItem('cv_result')
    const payloadStr = localStorage.getItem('cv_payload')
    
    if (!resultStr) {
      navigate('/cv')
      return
    }

    const result = JSON.parse(resultStr)
    setCvText(result.cv || '')

    if (payloadStr) {
      const payload = JSON.parse(payloadStr)
      setTargetRole(payload.targetRole || '')
    }
  }, [navigate])

  if (!cvText) {
    return null
  }

  return <CvRenderer cvText={cvText} targetRole={targetRole} />
}
