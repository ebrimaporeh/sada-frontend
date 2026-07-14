export const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  MODERATOR: 'moderator',
  FINANCE_OFFICER: 'finance_officer',
  CAMPAIGN_OWNER: 'campaign_owner',
}

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',

  // Public campaign routes
  CAMPAIGNS: '/campaigns',
  CAMPAIGN_DETAIL: '/campaigns/$slug',
  CAMPAIGN_NEW: '/campaigns/new',
  CATEGORIES: '/categories',

  // Authenticated routes
  DASHBOARD: '/dashboard',
  MY_CAMPAIGNS: '/my-campaigns',
  MY_CAMPAIGN_DETAIL: '/my-campaigns/$slug',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  NOTIFICATIONS: '/notifications',
  VERIFICATION: '/verification',
  DONATE: '/donate/$slug',
  DONATE_SUCCESS: '/donate/$slug/success',

  // Admin routes
  ADMIN_USERS: '/admin/users',
  ADMIN_STAFF: '/admin/staff',
  ADMIN_CAMPAIGNS: '/admin/campaigns',
  ADMIN_DONATIONS: '/admin/donations',
  ADMIN_PROFILE: '/admin/profile',
  ADMIN_VERIFICATIONS: '/admin/verifications',
  ADMIN_VERIFICATION: '/admin/verification',

  // Support pages
  ABOUT: '/about',
  HELP: '/help',
  TRUST_SAFETY: '/trust-safety',
  PRIVACY: '/privacy',
  TERMS: '/terms',
}

export const CAMPAIGN_STATUS = {
  DRAFT: 'draft',
  PENDING: 'pending',
  APPROVED: 'approved',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  REJECTED: 'rejected',
  SUSPENDED: 'suspended',
}

export const DONATION_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
}

// ModemPay is the payment gateway, not itself a provider — these are the
// underlying networks it processes payments through. Card is not supported
// by ModemPay (confirmed 2026-07-14) — mobile money only.
// Donations can go through either network; ModemPay's checkout page decides
// what's actually offered to the donor.
export const PAYMENT_METHODS = [
  { id: 'wave', name: 'Wave', short: 'W', color: 'bg-cyan-500', description: 'Wave mobile money' },
  { id: 'aps', name: 'APS Wallet', short: 'APS', color: 'bg-blue-800', description: 'APS mobile wallet' },
  // { id: 'modempay_bank', name: 'ModemPay Bank', short: 'MPB', color: 'bg-indigo-600', description: 'Bank transfer via ModemPay' },
]

// Withdrawals only support wave right now — ModemPay's payout/transfer API
// doesn't list aps as a valid network (only their checkout/donation side does).
export const PAYOUT_METHODS = PAYMENT_METHODS.filter((p) => p.id === 'wave')

export const GAMBIA_REGIONS = [
  { value: 'banjul',      label: 'Banjul' },
  { value: 'kanifing',    label: 'Kanifing' },
  { value: 'brikama',     label: 'Brikama' },
  { value: 'mansakonko',  label: 'Mansakonko' },
  { value: 'kerewan',     label: 'Kerewan' },
  { value: 'kuntaur',     label: 'Kuntaur' },
  { value: 'janjanbureh', label: 'Janjanbureh' },
  { value: 'basse',       label: 'Basse' },
]

export const QUERY_STALE_TIME = {
  SHORT: 1000 * 30,
  MEDIUM: 1000 * 60 * 5,
  LONG: 1000 * 60 * 60,
}
