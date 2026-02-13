export function getPlanQuotas(planCode: string): Record<string, number> {
  switch (planCode) {
    case 'FREE':
      return {
        TEXT_SUMMARIZATION: 10,
        IMAGE_ENHANCE: 0,
      }
    case 'PRO':
      return {
        TEXT_SUMMARIZATION: 1000,
        IMAGE_ENHANCE: 100,
      }
    default:
      throw new Error(`UNKNOWN_PLAN: ${planCode}`)
  }
}
