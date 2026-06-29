export const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  MODERATOR: 'moderator',
  CAMPAIGN_OWNER: 'campaign_owner',
}

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',

  // Public campaign routes
  CAMPAIGNS: '/campaigns',
  CAMPAIGN_DETAIL: '/campaigns/$slug',
  CAMPAIGN_NEW: '/campaigns/new',

  // Authenticated routes
  DASHBOARD: '/dashboard',
  MY_CAMPAIGNS: '/my-campaigns',
  MY_CAMPAIGN_DETAIL: '/my-campaigns/$slug',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  DONATE: '/donate/$slug',
  DONATE_SUCCESS: '/donate/$slug/success',

  // Admin routes
  ADMIN_USERS: '/admin/users',
  ADMIN_CAMPAIGNS: '/admin/campaigns',
  ADMIN_DONATIONS: '/admin/donations',

  // Support pages
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

export const PAYMENT_METHODS = [
  // { id: 'modempay',    name: 'ModemPay',     short: 'MP', color: 'bg-blue-600',   description: 'All mobile money networks' },
  { id: 'wave',        name: 'Wave',          short: 'W',  color: 'bg-cyan-500',   description: 'Wave mobile money' },
  // { id: 'orange_money',name: 'Orange Money',  short: 'OM', color: 'bg-orange-500', description: 'Orange Money' },
  { id: 'aps',   name: 'Afrimoney',     short: 'AF', color: 'bg-blue-800',  description: 'APS mobile money' },
]

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
