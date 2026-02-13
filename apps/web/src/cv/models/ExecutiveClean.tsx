import React from 'react'
import { ParsedCv } from '../parser'
import { A4_DIMENSIONS } from '../SnapGrid'

interface ExecutiveCleanProps {
  cv: ParsedCv
  targetRole: string
  isTwoPage: boolean
}

export function ExecutiveClean({ cv, targetRole, isTwoPage }: ExecutiveCleanProps) {
  const experienceSection = cv.sections.find((s) =>
    /^(EXPÉRIENCE|EXPERIENCE)/i.test(s.title)
  )
  const educationSection = cv.sections.find((s) =>
    /^(FORMATION|EDUCATION)/i.test(s.title)
  )
  const skillsSection = cv.sections.find((s) =>
    /^(COMPÉTENCES|SKILLS)/i.test(s.title)
  )

  return (
    <div
      style={{
        fontFamily: "'Georgia', 'Times New Roman', serif",
        fontSize: 11,
        lineHeight: 1.5,
        color: '#1a1a1a',
      }}
    >
      <div
        style={{
          borderBottom: '2px solid #1a1a1a',
          paddingBottom: 12,
          marginBottom: 20,
        }}
      >
        <h1
          style={{
            fontSize: 24,
            fontWeight: 'normal',
            margin: 0,
            marginBottom: 4,
            letterSpacing: 1,
          }}
        >
          {cv.header.name || targetRole}
        </h1>
        {cv.header.title && (
          <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
            {cv.header.title}
          </div>
        )}
        {cv.header.contact && cv.header.contact.length > 0 && (
          <div
            style={{
              fontSize: 9,
              color: '#666',
              marginTop: 8,
              display: 'flex',
              gap: 16,
              flexWrap: 'wrap',
            }}
          >
            {cv.header.contact.map((contact, i) => (
              <span key={i}>{contact}</span>
            ))}
          </div>
        )}
      </div>

      {cv.profile && (
        <div style={{ marginBottom: 20 }}>
          <h2
            style={{
              fontSize: 12,
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: 1,
              marginBottom: 8,
              borderBottom: '1px solid #ccc',
              paddingBottom: 4,
            }}
          >
            PROFIL
          </h2>
          <p style={{ margin: 0, fontSize: 10, lineHeight: 1.6 }}>
            {cv.profile.split('\n').slice(0, 4).join(' ')}
          </p>
        </div>
      )}

      {experienceSection && (
        <div style={{ marginBottom: 20 }}>
          <h2
            style={{
              fontSize: 12,
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: 1,
              marginBottom: 12,
              borderBottom: '1px solid #ccc',
              paddingBottom: 4,
            }}
          >
            {experienceSection.title.toUpperCase()}
          </h2>
          <div style={{ fontSize: 10 }}>
            {experienceSection.lines.map((line, i) => {
              const isDate = /^\d{4}|\b(Jan|Fév|Mar|Avr|Mai|Jun|Jul|Aoû|Sep|Oct|Nov|Déc)/i.test(line)
              const isTitle = i === 0 || /^[A-ZÀ-Ÿ]/.test(line)
              return (
                <div
                  key={i}
                  style={{
                    marginBottom: isDate ? 8 : 4,
                    fontWeight: isTitle ? 'bold' : 'normal',
                    fontSize: isDate ? 9 : 10,
                    color: isDate ? '#666' : '#1a1a1a',
                  }}
                >
                  {line}
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 24, marginTop: 20 }}>
        {educationSection && (
          <div style={{ flex: 1 }}>
            <h2
              style={{
                fontSize: 12,
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: 1,
                marginBottom: 8,
                borderBottom: '1px solid #ccc',
                paddingBottom: 4,
              }}
            >
              {educationSection.title.toUpperCase()}
            </h2>
            <div style={{ fontSize: 10 }}>
              {educationSection.lines.slice(0, 6).map((line, i) => (
                <div key={i} style={{ marginBottom: 4 }}>
                  {line}
                </div>
              ))}
            </div>
          </div>
        )}

        {skillsSection && (
          <div style={{ flex: 1 }}>
            <h2
              style={{
                fontSize: 12,
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: 1,
                marginBottom: 8,
                borderBottom: '1px solid #ccc',
                paddingBottom: 4,
              }}
            >
              {skillsSection.title.toUpperCase()}
            </h2>
            <div style={{ fontSize: 10 }}>
              {skillsSection.lines.slice(0, 8).map((line, i) => (
                <div key={i} style={{ marginBottom: 3 }}>
                  {line}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
