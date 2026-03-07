const BUCKETS = new Map<string, number[]>()

export function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const windowStart = now - windowMs
  const existing = BUCKETS.get(key) ?? []
  const kept = existing.filter(ts => ts > windowStart)
  kept.push(now)
  BUCKETS.set(key, kept)
  return kept.length > limit
}

export function getRequestIp(request: Request): string {
  const xff = request.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0]?.trim() ?? 'unknown'
  return request.headers.get('x-real-ip') ?? 'unknown'
}
