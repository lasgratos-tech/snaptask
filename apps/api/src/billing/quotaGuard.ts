export function assertWithinQuota(
  used: number,
  limit: number,
) {
  if (used >= limit) {
    throw new Error('QUOTA_EXCEEDED')
  }
}
