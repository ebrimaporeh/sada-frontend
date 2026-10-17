import { describe, it, expect } from 'vitest'
import { isValidGambiaPhone, normalizeGambiaPhone, toGambiaE164 } from './validators'

describe('normalizeGambiaPhone', () => {
  it('strips non-digits', () => {
    expect(normalizeGambiaPhone('877-000-000')).toBe('877000000')
  })

  it('strips a leading country code', () => {
    expect(normalizeGambiaPhone('+220 877 000 000')).toBe('877000000')
    expect(normalizeGambiaPhone('220877000000')).toBe('877000000')
  })

  it('leaves a bare local number alone', () => {
    expect(normalizeGambiaPhone('877000000')).toBe('877000000')
  })

  it('blank in, blank out', () => {
    expect(normalizeGambiaPhone('')).toBe('')
    expect(normalizeGambiaPhone(undefined)).toBe('')
    expect(normalizeGambiaPhone(null)).toBe('')
  })
})

describe('isValidGambiaPhone', () => {
  it('accepts a 9-digit number starting with 8, with or without +220', () => {
    expect(isValidGambiaPhone('877000000')).toBe(true)
    expect(isValidGambiaPhone('+220877000000')).toBe(true)
  })

  it('is true for blank -- every field this backs is optional', () => {
    expect(isValidGambiaPhone('')).toBe(true)
  })

  it('rejects the old 7-digit format', () => {
    expect(isValidGambiaPhone('7700000')).toBe(false)
  })

  it('rejects 9 digits not starting with 8', () => {
    expect(isValidGambiaPhone('977000000')).toBe(false)
  })

  it('rejects wrong lengths', () => {
    expect(isValidGambiaPhone('87700000')).toBe(false) // 8 digits
    expect(isValidGambiaPhone('8770000000')).toBe(false) // 10 digits
  })
})

describe('toGambiaE164', () => {
  it('prefixes +220 onto bare local digits', () => {
    expect(toGambiaE164('877000000')).toBe('+220877000000')
  })

  it('returns empty string for blank input', () => {
    expect(toGambiaE164('')).toBe('')
  })
})
