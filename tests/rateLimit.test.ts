import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { clientIp, rateLimited, resetRateLimiter } from '@/lib/rate-limit'

describe('rateLimited', () => {
  beforeEach(() => {
    resetRateLimiter()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-05T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('allows requests under the limit', () => {
    for (let i = 0; i < 5; i++) {
      expect(rateLimited('k', 5, 60_000)).toBe(false)
    }
  })

  it('blocks the request that exceeds the limit', () => {
    for (let i = 0; i < 5; i++) rateLimited('k', 5, 60_000)
    expect(rateLimited('k', 5, 60_000)).toBe(true)
  })

  it('tracks keys independently', () => {
    for (let i = 0; i < 5; i++) rateLimited('a', 5, 60_000)
    expect(rateLimited('a', 5, 60_000)).toBe(true)
    expect(rateLimited('b', 5, 60_000)).toBe(false)
  })

  it('unblocks after the window expires', () => {
    for (let i = 0; i < 5; i++) rateLimited('k', 5, 60_000)
    expect(rateLimited('k', 5, 60_000)).toBe(true)
    vi.advanceTimersByTime(61_000)
    expect(rateLimited('k', 5, 60_000)).toBe(false)
  })

  it('blocked attempts do not extend the window', () => {
    for (let i = 0; i < 5; i++) rateLimited('k', 5, 60_000)
    vi.advanceTimersByTime(30_000)
    expect(rateLimited('k', 5, 60_000)).toBe(true) // still blocked, must not re-arm
    vi.advanceTimersByTime(31_000)
    expect(rateLimited('k', 5, 60_000)).toBe(false)
  })
})

describe('clientIp', () => {
  it('takes the first x-forwarded-for hop', () => {
    const req = new Request('http://x', {
      headers: { 'x-forwarded-for': '203.0.113.7, 10.0.0.1' },
    })
    expect(clientIp(req)).toBe('203.0.113.7')
  })

  it('falls back to "unknown" without the header', () => {
    expect(clientIp(new Request('http://x'))).toBe('unknown')
  })
})
