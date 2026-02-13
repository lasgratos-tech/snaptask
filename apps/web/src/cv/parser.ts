export interface CvSection {
  title: string
  content: string
  lines: string[]
}

export interface ParsedCv {
  header: {
    name?: string
    title?: string
    contact?: string[]
  }
  profile: string
  sections: CvSection[]
  rawText: string
}

const SECTION_PATTERNS = [
  /^(PROFIL|PROFILE|À PROPOS|ABOUT|RÉSUMÉ|SUMMARY|OBJECTIF|OBJECTIVE)$/i,
  /^(EXPÉRIENCE|EXPERIENCE|EXPÉRIENCES PROFESSIONNELLES|PROFESSIONAL EXPERIENCE)$/i,
  /^(FORMATION|EDUCATION|ÉTUDES|STUDIES)$/i,
  /^(COMPÉTENCES|SKILLS|COMPETENCES)$/i,
  /^(LANGUES|LANGUAGES|LANGUE)$/i,
  /^(CERTIFICATIONS|CERTIFICATS|CERTIFICATIONS)$/i,
  /^(PROJETS|PROJECTS|RÉALISATIONS)$/i,
]

export function parseCvText(text: string): ParsedCv {
  const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 0)
  const sections: CvSection[] = []
  let currentSection: CvSection | null = null
  let profile = ''
  let headerLines: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const isSectionTitle = SECTION_PATTERNS.some((pattern) => pattern.test(line))

    if (isSectionTitle) {
      if (currentSection) {
        sections.push(currentSection)
      }
      currentSection = {
        title: line,
        content: '',
        lines: [],
      }
    } else {
      if (currentSection) {
        currentSection.lines.push(line)
        currentSection.content += (currentSection.content ? '\n' : '') + line
      } else {
        if (i < 3) {
          headerLines.push(line)
        } else if (!profile) {
          profile = line
        }
      }
    }
  }

  if (currentSection) {
    sections.push(currentSection)
  }

  const experienceSection = sections.find((s) =>
    /^(EXPÉRIENCE|EXPERIENCE)/i.test(s.title)
  )
  const educationSection = sections.find((s) =>
    /^(FORMATION|EDUCATION)/i.test(s.title)
  )
  const skillsSection = sections.find((s) =>
    /^(COMPÉTENCES|SKILLS)/i.test(s.title)
  )

  return {
    header: {
      name: headerLines[0] || '',
      title: headerLines[1] || '',
      contact: headerLines.slice(2),
    },
    profile: profile || sections.find((s) => /^(PROFIL|PROFILE|RÉSUMÉ)/i.test(s.title))?.content || '',
    sections,
    rawText: text,
  }
}

export function estimateYearsOfExperience(cv: ParsedCv): number {
  const expSection = cv.sections.find((s) =>
    /^(EXPÉRIENCE|EXPERIENCE)/i.test(s.title)
  )
  if (!expSection) return 0

  const yearMatches = expSection.content.match(/\b(19|20)\d{2}\b/g)
  if (!yearMatches || yearMatches.length < 2) return 0

  const years = yearMatches.map(Number).sort((a, b) => a - b)
  const oldest = years[0]
  const newest = years[years.length - 1]
  return Math.max(0, newest - oldest)
}

export function shouldUseTwoPages(cv: ParsedCv, targetRole: string): boolean {
  const years = estimateYearsOfExperience(cv)
  const isSenior =
    /senior|lead|principal|director|head|chief|expert|architect/i.test(targetRole) ||
    /dev|développeur|developer/i.test(targetRole)
  return years >= 7 || isSenior
}
