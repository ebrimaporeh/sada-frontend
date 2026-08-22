// Frontend mirror of sada-backend/permissions/roles.py's Resource keys and
// labels — those don't change at runtime, so they're still safe to keep as
// a static list here (see the root .claude/CLAUDE.md: no shared schema,
// keep both sides in sync by hand).
//
// WHO has which resource is no longer static, though — MANAGED_ROLES'
// (moderator, finance officer) access is admin-editable at runtime via
// Django Groups (Settings -> Staff), so there's no ROLE_RESOURCES map here
// to mirror anymore. Instead, every /users/me/ response carries the
// current user's own `resources` array (UserSerializer.resources,
// computed server-side from their live group permissions) — that array is
// what hasResourceAccess() below actually checks.
import { ROLES, ROUTES } from '@/constants'

export const Resource = {
  USERS: 'users',
  STAFF: 'staff',
  DASHBOARD: 'dashboard',
  SETTINGS: 'settings',
  CAMPAIGNS_VIEW: 'campaigns_view',
  CAMPAIGNS_MODERATE: 'campaigns_moderate',
  CATEGORIES: 'categories',
  REPORTS: 'reports',
  VERIFICATIONS: 'verifications',
  DONATIONS: 'donations',
  FINANCES: 'finances',
  AUDIT: 'audit',
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
  [Resource.AUDIT]: 'Audit log',
}

export const ROLE_LABELS = {
  [ROLES.ADMIN]: 'Admin',
  [ROLES.MODERATOR]: 'Moderator',
  [ROLES.FINANCE_OFFICER]: 'Finance Officer',
  [ROLES.USER]: 'User',
}

// Roles whose resource access is admin-editable at runtime (Settings ->
// Staff). Mirrors permissions.roles.MANAGED_ROLES on the backend — ADMIN
// is deliberately excluded there (always gets everything), so it's
// excluded here too.
export const MANAGED_ROLES = [ROLES.MODERATOR, ROLES.FINANCE_OFFICER]

// Priority order for picking a landing page from whatever resources a user
// actually has -- mirrors permissions.roles.LANDING_RESOURCE_PRIORITY.
// Resource-driven rather than role-keyed since a role's resources (and
// therefore where it can land) can now change at runtime.
const LANDING_ROUTES_BY_RESOURCE = [
  [Resource.DASHBOARD, '/admin'],
  [Resource.CAMPAIGNS_VIEW, ROUTES.ADMIN_CAMPAIGNS],
  [Resource.DONATIONS, ROUTES.ADMIN_DONATIONS],
  [Resource.USERS, ROUTES.ADMIN_USERS],
  [Resource.REPORTS, '/admin/reports'],
  [Resource.VERIFICATIONS, ROUTES.ADMIN_VERIFICATIONS],
  [Resource.FINANCES, '/admin/finances'],
  [Resource.AUDIT, ROUTES.ADMIN_AUDIT],
  [Resource.CATEGORIES, '/admin/categories'],
  [Resource.SETTINGS, '/admin/settings'],
  [Resource.STAFF, ROUTES.ADMIN_STAFF],
]

export function isAdminAreaRole(role) {
  return role === ROLES.ADMIN || role === ROLES.MODERATOR || role === ROLES.FINANCE_OFFICER
}

// `resources` is the current user's own resource list (`me.resources`),
// not a role — the caller no longer needs to know which role maps to
// which resources, since that mapping can change at runtime and only the
// backend (the actual Group/Permission source of truth) can answer it.
export function hasResourceAccess(resources, resource) {
  return Array.isArray(resources) && resources.includes(resource)
}

// Where to land a user with this resource list instead of the (admin-only)
// dashboard, or as the redirect target when a route's own resource check
// fails. Walks resources in priority order rather than trusting a stale
// per-role map, so it can't send someone to a page they no longer have.
export function landingRouteForResources(resources) {
  for (const [resource, route] of LANDING_ROUTES_BY_RESOURCE) {
    if (hasResourceAccess(resources, resource)) return route
  }
  return ROUTES.DASHBOARD
}
