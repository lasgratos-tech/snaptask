import React from 'react'

const A4_WIDTH = 794
const A4_HEIGHT = 1123
const MARGIN = 48

interface SnapGridProps {
  children: React.ReactNode
  page2?: React.ReactNode
  isTwoPage?: boolean
}

export function SnapGrid({ children, page2, isTwoPage = false }: SnapGridProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '24px 0',
        backgroundColor: '#f5f5f5',
        minHeight: '100vh',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: isTwoPage ? 'row' : 'column',
          gap: 24,
          alignItems: 'flex-start',
        }}
      >
        <div
          style={{
            width: A4_WIDTH,
            minHeight: A4_HEIGHT,
            backgroundColor: 'white',
            padding: MARGIN,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            position: 'relative',
          }}
        >
          {children}
        </div>
        {isTwoPage && page2 && (
          <div
            style={{
              width: A4_WIDTH,
              minHeight: A4_HEIGHT,
              backgroundColor: 'white',
              padding: MARGIN,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              position: 'relative',
            }}
          >
            {page2}
          </div>
        )}
      </div>
    </div>
  )
}

export const A4_DIMENSIONS = {
  width: A4_WIDTH,
  height: A4_HEIGHT,
  margin: MARGIN,
  contentWidth: A4_WIDTH - MARGIN * 2,
  contentHeight: A4_HEIGHT - MARGIN * 2,
}
