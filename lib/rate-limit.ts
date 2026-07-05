// Sliding-window request limiter, in-memory per serverless instance.
//
// Vercel keeps module state only for a warm instance, so this is a
// best-effort guard: enough to blunt password brute force and accidental
// floods on a single-region personal site, not an exact global limit.
// Upgrade path if that ever matters: Upstash/Redis.

const buckets = new Map<string, number[]>()

/** Record a hit for `key`; returns true when the key is over its limit. */
export function rateLimited(key: string, limit: number, windowMs: number): boolean {
  const cutoff = Date.now() - windowMs
  const hits = (buckets.get(key) ?? []).filter((t) => t > cutoff)
  if (hits.length >= limit) {
    buckets.set(key, hits)
    return true
  }
  hits.push(Date.now())
  buckets.set(key, hits)
  return false
}

export function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  return forwarded ? forwarded.split(',')[0].trim() : 'unknown'
}

/** Test hook — limiter state is module-global. */
export function resetRateLimiter(): void {
  buckets.clear()
}
