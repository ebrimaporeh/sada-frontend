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

// Vestigial as of the individual+organization-membership redesign -- every
// account registers (and stays) INDIVIDUAL now; an organization is a
// separate multi-member entity a person creates/joins afterward (see
// src/features/organizations), not a type of account. Kept only because a
// few admin-side pages (Users/Campaigners "Organizations" tab, the org
// verification review flow) still read it pending their own rebuild against
// the new Organization-backed endpoints -- don't use ACCOUNT_TYPES.ORGANIZATION
// to gate new UI, it's never actually set by anything anymore.
export const ACCOUNT_TYPES = {
  INDIVIDUAL: 'individual',
  ORGANIZATION: 'organization',
}

// Stale placeholder list from before OrganizationType became DB-backed (see
// sada-backend apps.organizations.models.OrganizationType) -- kept only for
// the same not-yet-rebuilt admin pages ACCOUNT_TYPES above is. New
// organization-type-aware UI must fetch the live, launch-visible catalog via
// useOrganizationTypes() (src/hooks/useOrganizations.js) instead of this list,
// since the real set (NGO/CSO/etc., with Company/Government Agency seeded but
// hidden this launch) no longer matches what's written here.
export const ORGANIZATION_TYPES = [
  { value: 'religious', label: 'Religious Organization' },
  { value: 'student_union', label: 'Student Union' },
  { value: 'community', label: 'Community-Based Organization' },
  { value: 'national_agency', label: 'National Agency' },
  { value: 'media', label: 'Media Organization' },
  { value: 'other', label: 'Other' },
]

// Mirrors sada-backend apps.organizations.permissions.OrganizationPermission
// -- see the root .claude/CLAUDE.md "one rule that spans both repos" note,
// there is no shared schema between the two stacks.
export const OrganizationPermission = {
  CREATE_CAMPAIGN: 'create_campaign',
  EDIT_CAMPAIGN: 'edit_campaign',
  DELETE_CAMPAIGN: 'delete_campaign',
  PAUSE_RESUME_CAMPAIGN: 'pause_resume_campaign',
  WITHDRAW_FUNDS: 'withdraw_funds',
  MANAGE_MEMBERS: 'manage_members',
}

// Labeled, ordered list for permission-checklist UI (role create/edit forms).
export const ORGANIZATION_PERMISSIONS = [
  { value: 'create_campaign', label: 'Create Campaign' },
  { value: 'edit_campaign', label: 'Edit Campaign' },
  { value: 'delete_campaign', label: 'Delete Campaign' },
  { value: 'pause_resume_campaign', label: 'Pause/Resume Campaign' },
  { value: 'withdraw_funds', label: 'Withdraw Funds' },
  { value: 'manage_members', label: 'Manage Members' },
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
  ORGANIZATIONS: '/organizations',
  ORGANIZATION_NEW: '/organizations/new',
  // Overview/Members/Roles/Settings are real nav items/routes, not tabs on
  // one page -- see AuthenticatedLayout's org-context nav.
  ORGANIZATION_OVERVIEW: '/organizations/$id/overview',
  ORGANIZATION_MEMBERS: '/organizations/$id/members',
  ORGANIZATION_ROLES: '/organizations/$id/roles',
  ORGANIZATION_SETTINGS: '/organizations/$id/settings',
  INVITATIONS: '/invitations',

  // Admin routes
  ADMIN_USERS: '/admin/users',
  ADMIN_USER_DETAIL: '/admin/users/$id',
  ADMIN_ORGANIZATION_DETAIL: '/admin/organizations/$id',
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

// Bridges an interrupted "accept invitation" flow across a login/register
// detour -- see InvitationPage and useAuth.js's postAuthDestination().
export const PENDING_INVITATION_STORAGE_KEY = 'pending_invitation_token'

export const QUERY_STALE_TIME = {
  SHORT: 1000 * 30,
  MEDIUM: 1000 * 60 * 5,
  LONG: 1000 * 60 * 60,
}
