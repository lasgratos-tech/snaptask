import React from 'react'
import { ParsedCv } from '../parser'

interface CreativeProProps {
  cv: ParsedCv
  targetRole: string
  isTwoPage: boolean
}

export function CreativePro({ cv, targetRole, isTwoPage }: CreativeProProps) {
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
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        fontSize: 10,
        lineHeight: 1.7,
        color: '#1a1a1a',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 24,
          paddingBottom: 16,
          borderBottom: '3px solid #6366f1',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              margin: 0,
              marginBottom: 4,
              color: '#1a1a1a',
            }}
          >
            {cv.header.name || targetRole}
          </h1>
          {cv.header.title && (
            <div style={{ fontSize: 11, color: '#6366f1', fontWeight: 500 }}>
              {cv.header.title}
            </div>
          )}
        </div>
        {cv.header.contact && cv.header.contact.length > 0 && (
          <div style={{ fontSize: 9, textAlign: 'right', lineHeight: 1.6 }}>
            {cv.header.contact.map((contact, i) => (
              <div key={i}>{contact}</div>
            ))}
          </div>
        )}
      </div>

      {cv.profile && (
        <div
          style={{
            marginBottom: 24,
            padding: 12,
            backgroundColor: '#f8f9fa',
            borderRadius: 6,
            borderLeft: '4px solid #6366f1',
          }}
        >
          <h2
            style={{
              fontSize: 10,
              fontWeight: 700,
              marginBottom: 8,
              color: '#6366f1',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            PROFIL
          </h2>
          <p style={{ margin: 0, fontSize: 10, lineHeight: 1.7 }}>
            {cv.profile.split('\n').slice(0, 4).join(' ')}
          </p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        <div>
          {experienceSection && (
            <div style={{ marginBottom: 24 }}>
              <h2
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  marginBottom: 12,
                  color: '#1a1a1a',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  borderBottom: '2px solid #6366f1',
                  paddingBottom: 4,
                }}
              >
                {experienceSection.title.toUpperCase()}
              </h2>
              {experienceSection.lines.map((line, i) => {
                const isDate = /^\d{4}|\b(Jan|Fév|Mar|Avr|Mai|Jun|Jul|Aoû|Sep|Oct|Nov|Déc)/i.test(line)
                const isTitle = i === 0 || /^[A-ZÀ-Ÿ]/.test(line)
                return (
                  <div
                    key={i}
                    style={{
                      marginBottom: isDate ? 12 : 8,
                      paddingLeft: isDate ? 0 : 12,
                      position: 'relative',
                    }}
                  >
                    {!isDate && (
                      <div
                        style={{
                          position: 'absolute',
                          left: 0,
                          top: 6,
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          backgroundColor: '#6366f1',
                        }}
                      />
                    )}
                    <div
                      style={{
                        fontWeight: isTitle ? 600 : 400,
                        fontSize: isDate ? 9 : 10,
                        color: isDate ? '#6b7280' : '#1a1a1a',
                      }}
                    >
                      {line}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div>
          {educationSection && (
            <div style={{ marginBottom: 20 }}>
              <h2
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  marginBottom: 10,
                  color: '#1a1a1a',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  borderBottom: '2px solid #6366f1',
                  paddingBottom: 4,
                }}
              >
                {educationSection.title.toUpperCase()}
              </h2>
              {educationSection.lines.slice(0, 8).map((line, i) => (
                <div key={i} style={{ marginBottom: 8, fontSize: 10 }}>
                  {line}
                </div>
              ))}
            </div>
          )}

          {skillsSection && (
            <div>
              <h2
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  marginBottom: 10,
                  color: '#1a1a1a',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  borderBottom: '2px solid #6366f1',
                  paddingBottom: 4,
                }}
              >
                {skillsSection.title.toUpperCase()}
              </h2>
              <div style={{ fontSize: 10 }}>
                {skillsSection.lines.slice(0, 12).map((line, i) => (
                  <div
                    key={i}
                    style={{
                      marginBottom: 6,
                      padding: '4px 8px',
                      backgroundColor: '#f1f5f9',
                      borderRadius: 4,
                      display: 'inline-block',
                      marginRight: 6,
                    }}
                  >
                    {line}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
