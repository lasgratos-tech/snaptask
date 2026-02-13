import React from 'react'
import { ParsedCv } from '../parser'

interface ExpertStructuredProps {
  cv: ParsedCv
  targetRole: string
  isTwoPage: boolean
}

interface ExpertStructuredResult {
  page1: React.ReactNode
  page2?: React.ReactNode
}

export function ExpertStructured({ cv, targetRole, isTwoPage }: ExpertStructuredProps): ExpertStructuredResult {
  const experienceSection = cv.sections.find((s) =>
    /^(EXPÉRIENCE|EXPERIENCE)/i.test(s.title)
  )
  const educationSection = cv.sections.find((s) =>
    /^(FORMATION|EDUCATION)/i.test(s.title)
  )
  const skillsSection = cv.sections.find((s) =>
    /^(COMPÉTENCES|SKILLS)/i.test(s.title)
  )

  const expLines = experienceSection?.lines || []
  const primaryExp = expLines.slice(0, isTwoPage ? 8 : 4)
  const secondaryExp = isTwoPage ? expLines.slice(8) : []

  const page1 = (
    <div
      style={{
        fontFamily: "'Helvetica Neue', 'Arial', sans-serif",
        fontSize: 10,
        lineHeight: 1.6,
        color: '#2c3e50',
      }}
    >
      <div
        style={{
          backgroundColor: '#2c3e50',
          color: 'white',
          padding: '20px 24px',
          margin: '-48px -48px 24px -48px',
        }}
      >
        <h1 style={{ fontSize: 20, margin: 0, fontWeight: 600 }}>
          {cv.header.name || targetRole}
        </h1>
        {cv.header.title && (
          <div style={{ fontSize: 11, marginTop: 4, opacity: 0.9 }}>
            {cv.header.title}
          </div>
        )}
        {cv.header.contact && cv.header.contact.length > 0 && (
          <div
            style={{
              fontSize: 9,
              marginTop: 12,
              display: 'flex',
              gap: 20,
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
              fontSize: 11,
              fontWeight: 700,
              color: '#2c3e50',
              marginBottom: 8,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            PROFIL PROFESSIONNEL
          </h2>
          <p style={{ margin: 0, fontSize: 10, lineHeight: 1.7 }}>
            {cv.profile.split('\n').slice(0, 4).join(' ')}
          </p>
        </div>
      )}

      {experienceSection && (
        <div style={{ marginBottom: 20 }}>
          <h2
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: '#2c3e50',
              marginBottom: 12,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            {experienceSection.title.toUpperCase()}
          </h2>
          {primaryExp.map((line, i) => {
            const isDate = /^\d{4}|\b(Jan|Fév|Mar|Avr|Mai|Jun|Jul|Aoû|Sep|Oct|Nov|Déc)/i.test(line)
            const isTitle = i === 0 || /^[A-ZÀ-Ÿ]/.test(line)
            return (
              <div
                key={i}
                style={{
                  marginBottom: isDate ? 10 : 6,
                  paddingLeft: isDate ? 0 : 16,
                  borderLeft: isDate ? 'none' : '2px solid #3498db',
                  paddingBottom: isDate ? 4 : 0,
                }}
              >
                <div
                  style={{
                    fontWeight: isTitle ? 600 : 400,
                    fontSize: isDate ? 9 : 10,
                    color: isDate ? '#7f8c8d' : '#2c3e50',
                  }}
                >
                  {line}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div style={{ display: 'flex', gap: 20, marginTop: 20 }}>
        {educationSection && (
          <div style={{ flex: 1 }}>
            <h2
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#2c3e50',
                marginBottom: 8,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              {educationSection.title.toUpperCase()}
            </h2>
            {educationSection.lines.slice(0, 6).map((line, i) => (
              <div key={i} style={{ marginBottom: 6, fontSize: 10 }}>
                {line}
              </div>
            ))}
          </div>
        )}

        {skillsSection && (
          <div style={{ flex: 1 }}>
            <h2
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#2c3e50',
                marginBottom: 8,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              {skillsSection.title.toUpperCase()}
            </h2>
            <div style={{ fontSize: 10 }}>
              {skillsSection.lines.slice(0, 10).map((line, i) => (
                <div key={i} style={{ marginBottom: 4 }}>
                  • {line}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )

  const page2 = isTwoPage && secondaryExp.length > 0 ? (
    <div
      style={{
        fontFamily: "'Helvetica Neue', 'Arial', sans-serif",
        fontSize: 10,
        lineHeight: 1.6,
        color: '#2c3e50',
      }}
    >
      <h2
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: '#2c3e50',
          marginBottom: 12,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        }}
      >
        EXPÉRIENCE (SUITE)
      </h2>
      {secondaryExp.map((line, i) => {
        const isDate = /^\d{4}|\b(Jan|Fév|Mar|Avr|Mai|Jun|Jul|Aoû|Sep|Oct|Nov|Déc)/i.test(line)
        return (
          <div
            key={i}
            style={{
              marginBottom: isDate ? 10 : 6,
              paddingLeft: isDate ? 0 : 16,
              borderLeft: isDate ? 'none' : '2px solid #3498db',
            }}
          >
            <div
              style={{
                fontWeight: 400,
                fontSize: isDate ? 9 : 10,
                color: isDate ? '#7f8c8d' : '#2c3e50',
              }}
            >
              {line}
            </div>
          </div>
        )
      })}
    </div>
  ) : null

  return { page1, page2 }
}
