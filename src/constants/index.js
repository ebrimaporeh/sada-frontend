import waveLogo from '@/assets/wave-logo.png'
import apsLogo from '@/assets/APS-logo.svg'
import afrimoneyLogo from '@/assets/afrimoney-logo.png'

export const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  MODERATOR: 'moderator',
  FINANCE_OFFICER: 'finance_officer',
  CAMPAIGN_OWNER: 'campaign_owner',
}

export const ACCOUNT_TYPES = {
  INDIVIDUAL: 'individual',
  ORGANIZATION: 'organization',
}

export const ORGANIZATION_TYPES = [
  { value: 'religious', label: 'Religious Organization' },
  { value: 'student_union', label: 'Student Union' },
  { value: 'community', label: 'Community-Based Organization' },
  { value: 'national_agency', label: 'National Agency' },
  { value: 'media', label: 'Media Organization' },
  { value: 'other', label: 'Other' },
]

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',
  CONFIRM_RECOVERY_EMAIL: '/confirm-recovery-email',

  // Public campaign routes
  CAMPAIGNS: '/campaigns',
  CAMPAIGN_DETAIL: '/campaigns/$slug',
  CAMPAIGN_NEW: '/campaigns/new',
  CATEGORIES: '/categories',

  // Public campaigner profile routes
  CAMPAIGNERS: '/campaigners',
  CAMPAIGNER_DETAIL: '/campaigners/$id',

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
  ADMIN_USER_DETAIL: '/admin/users/$id',
  ADMIN_STAFF: '/admin/staff',
  ADMIN_CAMPAIGNS: '/admin/campaigns',
  ADMIN_DONATIONS: '/admin/donations',
  ADMIN_PROFILE: '/admin/profile',
  ADMIN_VERIFICATIONS: '/admin/verifications',
  ADMIN_VERIFICATION: '/admin/verification',
  ADMIN_VISION: '/admin/vision',
  ADMIN_AUDIT: '/admin/audit',

  // Zakat calculator
  ZAKAT: '/zakat',

  // Support pages
  ABOUT: '/about',
  VISION: '/vision',
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

// Presentation metadata for every payment method this frontend knows how to
// render — which of these are actually usable comes from the backend
// (GET /payments/gateways/, see useGateways()), since that's driven by
// PAYMENT_GATEWAYS settings and can change (enable/disable Stripe, add a
// new country's gateway) without a frontend deploy. `gateway` groups
// methods by which backend adapter processes them (wave/aps -> modempay,
// card -> stripe); `requiresPhone` mirrors PaymentGateway.requires_phone.
export const PAYMENT_METHODS = [
  { id: 'wave', gateway: 'modempay', name: 'Wave', short: 'W', logo: waveLogo, color: 'bg-cyan-500', description: 'Wave mobile money', requiresPhone: true },
  { id: 'aps', gateway: 'modempay', name: 'APS Wallet', short: 'APS', logo: apsLogo, color: 'bg-blue-800', description: 'APS mobile wallet', requiresPhone: true },
  { id: 'afrimoney', gateway: 'modempay', name: 'Afrimoney', short: 'AM', logo: afrimoneyLogo, color: 'bg-orange-600', description: 'Afrimoney mobile money', requiresPhone: true },
  { id: 'card', gateway: 'stripe', name: 'Card', short: '\u{1F4B3}', color: 'bg-violet-600', description: 'Debit or credit card', requiresPhone: false },
]

// Withdrawals support wave and afrimoney — ModemPay's payout/transfer API
// doesn't list aps as a valid network (only their checkout/donation side
// does), and Stripe has no payout path to a Gambian mobile-money wallet at
// all. Still filtered against the backend's payout_methods in useGateways()
// consumers, so this is a presentation fallback, not the source of truth.
export const PAYOUT_METHODS = PAYMENT_METHODS.filter((p) => p.id === 'wave' || p.id === 'afrimoney')

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
