import React from 'react'
import { ParsedCv, parseCvText, shouldUseTwoPages } from './parser'
import { SnapGrid } from './SnapGrid'
import { ExecutiveClean } from './models/ExecutiveClean'
import { ExpertStructured } from './models/ExpertStructured'
import { CreativePro } from './models/CreativePro'

type CvModel = 'executive' | 'expert' | 'creative'

function selectModel(cv: ParsedCv, targetRole: string): CvModel {
  const models: CvModel[] = ['executive', 'expert', 'creative']
  const hash = cv.rawText.length + targetRole.length
  return models[hash % models.length]
}

interface CvRendererProps {
  cvText: string
  targetRole: string
}

export function CvRenderer({ cvText, targetRole }: CvRendererProps) {
  const parsed = parseCvText(cvText)
  const isTwoPage = shouldUseTwoPages(parsed, targetRole)
  const model = selectModel(parsed, targetRole)

  let page1: React.ReactNode
  let page2: React.ReactNode | undefined

  if (model === 'executive') {
    page1 = <ExecutiveClean cv={parsed} targetRole={targetRole} isTwoPage={isTwoPage} />
  } else if (model === 'expert') {
    const result = ExpertStructured({ cv: parsed, targetRole, isTwoPage })
    page1 = result.page1
    page2 = result.page2
  } else {
    page1 = <CreativePro cv={parsed} targetRole={targetRole} isTwoPage={isTwoPage} />
  }

  return (
    <SnapGrid isTwoPage={isTwoPage} page2={page2}>
      {page1}
    </SnapGrid>
  )
}
