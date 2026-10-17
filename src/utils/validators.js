export function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function isStrongPassword(value) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(value)
}

export function isRequired(value) {
  return value !== null && value !== undefined && String(value).trim() !== ''
}

// Gambia-only for now (the platform's only supported country) -- not a
// general phone-number rule. Mirrors sada-backend's utils/validators.py
// exactly (same GAMBIA_DIAL_CODE/normalize/validate shape) so the two
// sides never drift: PURA's numbering reform is complete, every Gambian
// mobile number is now exactly 9 digits, always starting with 8.
export const GAMBIA_DIAL_CODE = '220'

// Strips everything but digits, and a leading country code if present.
// Returns the bare local-number digits (not E.164) -- callers decide
// whether/how to re-attach +220.
export function normalizeGambiaPhone(value) {
  let digits = String(value ?? '').replace(/\D/g, '')
  if (digits.startsWith(GAMBIA_DIAL_CODE)) digits = digits.slice(GAMBIA_DIAL_CODE.length)
  return digits
}

// True for exactly 9 digits starting with 8, after normalizing. Blank
// counts as valid here -- every field this backs is optional; callers
// that need to require a phone check for a non-blank value separately.
export function isValidGambiaPhone(value) {
  if (!value) return true
  const digits = normalizeGambiaPhone(value)
  return digits.length === 9 && digits.startsWith('8')
}

// Local digits (no +220) -> the canonical E.164 string the backend
// expects/returns. Callers that only ever collect the bare 9-digit local
// number (the common UI pattern -- see PhoneInput.jsx) can pass that
// straight in, same as normalizeGambiaPhone's own output.
export function toGambiaE164(localDigits) {
  return localDigits ? `+${GAMBIA_DIAL_CODE}${localDigits}` : ''
}

export const GAMBIA_PHONE_ERROR = 'Enter a valid Gambian phone number -- 9 digits, starting with 8, after +220.'
