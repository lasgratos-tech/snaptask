export type CvInstantInput = {
  apiKey: string
  image: string
  targetRole: string
  language: 'fr' | 'en'
  style: 'classic' | 'modern' | 'executive'
  includeCoverLetter: boolean
}

export async function runCvInstantTask(params: CvInstantInput) {
  const res = await fetch('http://localhost:3000/v1/tasks/cv-instant', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${params.apiKey}`,
    },
    body: JSON.stringify({
      image: params.image,
      targetRole: params.targetRole,
      language: params.language,
      style: params.style,
      includeCoverLetter: params.includeCoverLetter,
    }),
  })

  const data = await res.json()
  if (!res.ok) {
    const message = data?.message ?? data?.error ?? 'API error'
    throw new Error(message)
  }
  return data
}
