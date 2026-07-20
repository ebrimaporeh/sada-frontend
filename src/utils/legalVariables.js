// {{key}} placeholders admins can type directly into the Legal/Help
// markdown (Settings -> Payments... -> Legal & Help) so prose like "a
// {{platform_fee_percent}}% fee applies" stays correct automatically when
// that setting changes elsewhere, instead of admins having to remember to
// go update every page that mentions the old number.
export const LEGAL_VARIABLE_DEFS = [
  { key: 'site_name', label: 'Site name' },
  { key: 'site_description', label: 'Site description' },
  { key: 'contact_email', label: 'Contact email' },
  { key: 'platform_fee_percent', label: 'Platform fee (number only — write the % yourself)' },
  { key: 'current_year', label: 'Current year' },
]

// Formats a platform_fee_percent Decimal-as-string ("1.00") down to how a
// human would actually write it in a sentence ("1", "2.5") — no trailing
// zeros, since the raw DB value is always fixed to 2 decimal places.
export function formatFeePercent(value) {
  if (value == null || value === '') return ''
  const num = Number(value)
  if (Number.isNaN(num)) return String(value)
  return String(num)
}

// Replaces every {{key}} in `text` with values[key], leaving anything with
// no matching value untouched (a typo'd or unsupported tag should stay
// visibly wrong, not silently disappear).
export function renderLegalVariables(text, values) {
  if (!text) return text
  return text.replace(/\{\{\s*([a-z0-9_]+)\s*\}\}/gi, (match, key) => {
    const value = values?.[key]
    return value != null && value !== '' ? String(value) : match
  })
}
