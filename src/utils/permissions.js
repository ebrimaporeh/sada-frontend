// Frontend mirror of sada-backend/permissions/roles.py — same resource names,
// same role → resource map. There is no shared schema between the two repos
// (see the root .claude/CLAUDE.md), so if you change access on one side,
// change it here too.
//
// To add a role: add it to ROLES in constants/index.js, then give it a
// resource set in ROLE_RESOURCES below.
// To gate a new admin page: pick (or add) a Resource, then use
// hasResourceAccess(role, resource) in that route's beforeLoad and in the
// sidebar nav filter.
import { ROLES, ROUTES } from '@/constants'

export const Resource = {
  USERS: 'users',
  STAFF: 'staff',
  DASHBOARD: 'dashboard',
  SETTINGS: 'settings',
  CAMPAIGNS_VIEW: 'campaigns.view',
  CAMPAIGNS_MODERATE: 'campaigns.moderate',
  CATEGORIES: 'categories',
  REPORTS: 'reports',
  VERIFICATIONS: 'verifications',
  DONATIONS: 'donations',
  FINANCES: 'finances',
}

export const RESOURCE_LABELS = {
  [Resource.USERS]: 'Users',
  [Resource.STAFF]: 'Staff management',
  [Resource.DASHBOARD]: 'Dashboard',
  [Resource.SETTINGS]: 'Platform settings',
  [Resource.CAMPAIGNS_VIEW]: 'Campaigns (view)',
  [Resource.CAMPAIGNS_MODERATE]: 'Campaigns (moderate)',
  [Resource.CATEGORIES]: 'Categories',
  [Resource.REPORTS]: 'Reports',
  [Resource.VERIFICATIONS]: 'Verifications',
  [Resource.DONATIONS]: 'Donations',
  [Resource.FINANCES]: 'Finances',
}

export const ROLE_LABELS = {
  [ROLES.ADMIN]: 'Admin',
  [ROLES.MODERATOR]: 'Moderator',
  [ROLES.FINANCE_OFFICER]: 'Finance Officer',
  [ROLES.USER]: 'User',
}

const ALL_RESOURCES = new Set(Object.values(Resource))

export const ROLE_RESOURCES = {
  [ROLES.ADMIN]: ALL_RESOURCES,
  [ROLES.MODERATOR]: new Set([
    Resource.CAMPAIGNS_VIEW, Resource.CAMPAIGNS_MODERATE,
    Resource.CATEGORIES, Resource.REPORTS, Resource.VERIFICATIONS,
  ]),
  [ROLES.FINANCE_OFFICER]: new Set([
    Resource.CAMPAIGNS_VIEW, Resource.DONATIONS, Resource.FINANCES,
  ]),
}

// First reachable admin page per role — where to land them instead of the
// (admin-only) dashboard.
export const ROLE_LANDING_ROUTE = {
  [ROLES.ADMIN]: '/admin',
  [ROLES.MODERATOR]: ROUTES.ADMIN_CAMPAIGNS,
  [ROLES.FINANCE_OFFICER]: ROUTES.ADMIN_CAMPAIGNS,
}

export function isAdminAreaRole(role) {
  return role === ROLES.ADMIN || role === ROLES.MODERATOR || role === ROLES.FINANCE_OFFICER
}

export function hasResourceAccess(role, resource) {
  return ROLE_RESOURCES[role]?.has(resource) ?? false
}

export function getResourcesForRole(role) {
  return Array.from(ROLE_RESOURCES[role] ?? [])
}
