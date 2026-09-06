export function formatDate(dateString, options = {}) {
  if (!dateString) return ''
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  }).format(new Date(dateString))
}

export function formatDateTime(dateString) {
  return formatDate(dateString, { hour: '2-digit', minute: '2-digit' })
}

export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)
}

export function formatGMD(amount) {
  if (!amount && amount !== 0) return 'D 0'
  return `D ${Math.round(Number(amount)).toLocaleString('en-US')}`
}

export function truncate(str, length = 100) {
  if (!str || str.length <= length) return str
  return str.slice(0, length) + '...'
}

export function capitalize(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export function initials(name) {
  if (!name) return '??'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Uncapped — campaigns can be overfunded, so this can read above 100
// (250%, 2256%, etc). Cap separately at the call site if you need a
// bounded value, e.g. for a progress bar's fill width.
export function progressPercent(raised, goal) {
  if (!goal || goal === 0) return 0
  return Math.round((raised / goal) * 100)
}

export function daysLeft(deadline) {
  if (!deadline) return 0
  const today = new Date()
  const end = new Date(deadline)
  const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24))
  return diff > 0 ? diff : 0
}

// A campaign with no deadline (Campaign.deadline=None on the backend) is
// "open-ended"/"ongoing" -- never "Ended" (daysLeft(null) === 0 alone can't
// tell those apart, so every "days left"/"Ended" display site needs to
// check this first). See architecture notes on campaigns without a
// deadline -- absence of a deadline is a real, deliberate campaign type,
// not missing data.
export function isOngoingCampaign(deadline) {
  return !deadline
}

export function timeAgo(dateString) {
  if (!dateString) return ''
  const now = new Date()
  const date = new Date(dateString)
  const diff = Math.floor((now - date) / 1000)

  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return formatDate(dateString)
}

export function compactNumber(num) {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return String(num)
}
