import { describe, it, expect } from 'vitest'
import { formatGMD, progressPercent, daysLeft, truncate, initials, compactNumber } from './formatters'

describe('formatGMD', () => {
  it('formats a positive amount with the D prefix and thousands separators', () => {
    expect(formatGMD(12345)).toBe('D 12,345')
  })

  it('rounds fractional amounts', () => {
    expect(formatGMD(99.6)).toBe('D 100')
  })

  it('treats missing/zero amounts as D 0', () => {
    expect(formatGMD(0)).toBe('D 0')
    expect(formatGMD(null)).toBe('D 0')
    expect(formatGMD(undefined)).toBe('D 0')
  })
})

describe('progressPercent', () => {
  it('computes a normal percentage', () => {
    expect(progressPercent(2500, 5000)).toBe(50)
  })

  it('is uncapped for an overfunded campaign', () => {
    expect(progressPercent(15000, 5000)).toBe(300)
  })

  it('returns 0 for a zero or missing goal instead of dividing by zero', () => {
    expect(progressPercent(100, 0)).toBe(0)
    expect(progressPercent(100, null)).toBe(0)
  })
})

describe('daysLeft', () => {
  it('returns 0 for a missing deadline', () => {
    expect(daysLeft(null)).toBe(0)
  })

  it('returns 0 rather than a negative number once the deadline has passed', () => {
    expect(daysLeft('2000-01-01')).toBe(0)
  })

  it('counts forward for a future deadline', () => {
    const future = new Date()
    future.setDate(future.getDate() + 10)
    expect(daysLeft(future.toISOString())).toBeGreaterThanOrEqual(9)
    expect(daysLeft(future.toISOString())).toBeLessThanOrEqual(10)
  })
})

describe('truncate', () => {
  it('leaves short strings untouched', () => {
    expect(truncate('short', 10)).toBe('short')
  })

  it('cuts long strings and appends an ellipsis', () => {
    expect(truncate('a'.repeat(20), 10)).toBe('a'.repeat(10) + '...')
  })
})

describe('initials', () => {
  it('takes the first letter of the first two words', () => {
    expect(initials('Amie Jallow')).toBe('AJ')
  })

  it('falls back to ?? for a missing name', () => {
    expect(initials('')).toBe('??')
    expect(initials(null)).toBe('??')
  })
})

describe('compactNumber', () => {
  it('abbreviates thousands and millions', () => {
    expect(compactNumber(1500)).toBe('1.5K')
    expect(compactNumber(2500000)).toBe('2.5M')
  })

  it('leaves small numbers as-is', () => {
    expect(compactNumber(42)).toBe('42')
  })
})
