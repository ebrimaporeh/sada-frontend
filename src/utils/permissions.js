// Frontend mirror of sada-backend/permissions/roles.py's Resource keys and
// labels — those don't change at runtime, so they're still safe to keep as
// a static list here (see the root .claude/CLAUDE.md: no shared schema,
// keep both sides in sync by hand).
//
// WHO has which resource, and which roles even exist, are both no longer
// static, though — an admin can create/edit/delete roles at runtime via
// the Roles & Permissions tab (backed by apps.rbac.models.Role and Django
// Groups), so there's no ROLE_RESOURCES or hardcoded role-list map here to
// mirror anymore. Instead:
//   - every /users/me/ response carries the current user's own `resources`
//     array (UserSerializer.resources, computed server-side from their
//     live group permissions) — that's what hasResourceAccess() checks.
//   - the live role catalog (name + resources per role) comes from
//     useRolePermissions() (src/hooks/usePermissions.js), already grouped
//     by entity by the backend for the checklist UI.
import { ROLES, ROUTES } from '@/constants'

export const Resource = {
  USERS_VIEW: 'users_view',
  USERS_EDIT: 'users_edit',
  USERS_DELETE: 'users_delete',
  STAFF_VIEW: 'staff_view',
  STAFF_CREATE: 'staff_create',
  STAFF_EDIT: 'staff_edit',
  STAFF_DELETE: 'staff_delete',
  ROLES_MANAGE: 'roles_manage',
  DASHBOARD_VIEW: 'dashboard_view',
  SETTINGS_EDIT: 'settings_edit',
  CAMPAIGNS_VIEW: 'campaigns_view',
  CAMPAIGNS_MODERATE: 'campaigns_moderate',
  CATEGORIES_VIEW: 'categories_view',
  CATEGORIES_CREATE: 'categories_create',
  CATEGORIES_EDIT: 'categories_edit',
  CATEGORIES_DELETE: 'categories_delete',
  REPORTS_VIEW: 'reports_view',
  REPORTS_EDIT: 'reports_edit',
  VERIFICATIONS_VIEW: 'verifications_view',
  VERIFICATIONS_EDIT: 'verifications_edit',
  DONATIONS_VIEW: 'donations_view',
  DONATIONS_EDIT: 'donations_edit',
  FINANCES_VIEW: 'finances_view',
  AUDIT_VIEW: 'audit_view',
}

export const RESOURCE_LABELS = {
  [Resource.USERS_VIEW]: 'Users (view)',
  [Resource.USERS_EDIT]: 'Users (edit)',
  [Resource.USERS_DELETE]: 'Users (delete)',
  [Resource.STAFF_VIEW]: 'Staff (view)',
  [Resource.STAFF_CREATE]: 'Staff (create)',
  [Resource.STAFF_EDIT]: 'Staff (edit)',
  [Resource.STAFF_DELETE]: 'Staff (delete)',
  [Resource.ROLES_MANAGE]: 'Roles & Permissions (manage)',
  [Resource.DASHBOARD_VIEW]: 'Dashboard (view)',
  [Resource.SETTINGS_EDIT]: 'Settings (edit)',
  [Resource.CAMPAIGNS_VIEW]: 'Campaigns (view)',
  [Resource.CAMPAIGNS_MODERATE]: 'Campaigns (moderate)',
  [Resource.CATEGORIES_VIEW]: 'Categories (view)',
  [Resource.CATEGORIES_CREATE]: 'Categories (create)',
  [Resource.CATEGORIES_EDIT]: 'Categories (edit)',
  [Resource.CATEGORIES_DELETE]: 'Categories (delete)',
  [Resource.REPORTS_VIEW]: 'Reports (view)',
  [Resource.REPORTS_EDIT]: 'Reports (edit)',
  [Resource.VERIFICATIONS_VIEW]: 'Verifications (view)',
  [Resource.VERIFICATIONS_EDIT]: 'Verifications (edit)',
  [Resource.DONATIONS_VIEW]: 'Donations (view)',
  [Resource.DONATIONS_EDIT]: 'Donations (edit)',
  [Resource.FINANCES_VIEW]: 'Finances (view)',
  [Resource.AUDIT_VIEW]: 'Audit log (view)',
}

// Only the two roles that AREN'T rows in the runtime Role catalog — every
// other role's display name comes from useRolePermissions().roles (see
// roleLabel() below).
export const FIXED_ROLE_LABELS = {
  [ROLES.ADMIN]: 'Admin',
  [ROLES.USER]: 'User',
}

// `dynamicRoles` is useRolePermissions()'s live `roles` array
// ([{role, label, resources}]) — pass it in from wherever that query is
// already fetched rather than re-fetching here.
export function roleLabel(role, dynamicRoles = []) {
  if (FIXED_ROLE_LABELS[role]) return FIXED_ROLE_LABELS[role]
  return dynamicRoles.find((r) => r.role === role)?.label || role
}

// A small fixed palette a role's badge color is deterministically picked
// from by its slug — so a brand-new custom role still gets a distinct,
// stable color with no map to maintain by hand. Admin keeps its own fixed
// color rather than being hashed in, since it's the one role that's never
// just "a bag of resources."
const ROLE_BADGE_PALETTE = [
  'bg-blue-100 text-blue-700',
  'bg-amber-100 text-amber-700',
  'bg-teal-100 text-teal-700',
  'bg-rose-100 text-rose-700',
  'bg-indigo-100 text-indigo-700',
  'bg-cyan-100 text-cyan-700',
]

export function roleBadgeClass(role) {
  if (role === ROLES.ADMIN) return 'bg-purple-100 text-purple-700'
  let hash = 0
  for (let i = 0; i < role.length; i++) hash = (hash * 31 + role.charCodeAt(i)) >>> 0
  return ROLE_BADGE_PALETTE[hash % ROLE_BADGE_PALETTE.length]
}

// Priority order for picking a landing page from whatever resources a user
// actually has -- mirrors permissions.roles.LANDING_RESOURCE_PRIORITY.
// Resource-driven rather than role-keyed since a role's resources (and
// therefore where it can land) can now change at runtime.
const LANDING_ROUTES_BY_RESOURCE = [
  [Resource.DASHBOARD_VIEW, '/admin'],
  [Resource.CAMPAIGNS_VIEW, ROUTES.ADMIN_CAMPAIGNS],
  [Resource.DONATIONS_VIEW, ROUTES.ADMIN_DONATIONS],
  [Resource.USERS_VIEW, ROUTES.ADMIN_USERS],
  [Resource.REPORTS_VIEW, '/admin/reports'],
  [Resource.VERIFICATIONS_VIEW, ROUTES.ADMIN_VERIFICATIONS],
  [Resource.FINANCES_VIEW, '/admin/finances'],
  [Resource.AUDIT_VIEW, ROUTES.ADMIN_AUDIT],
  [Resource.CATEGORIES_VIEW, '/admin/categories'],
  [Resource.SETTINGS_EDIT, '/admin/settings'],
  [Resource.STAFF_VIEW, ROUTES.ADMIN_STAFF],
]

// Admin always qualifies (its full-access escape hatch isn't resource-
// driven). Anyone else — Moderator, Finance Officer, or any brand-new
// custom role — qualifies the moment they've actually been granted at
// least one resource, rather than by matching a hardcoded role name. A
// role with zero grants (e.g. just created, not yet configured) correctly
// does *not* count as admin-area yet.
export function isAdminAreaRole(user) {
  if (!user) return false
  if (user.role === ROLES.ADMIN) return true
  return Array.isArray(user.resources) && user.resources.length > 0
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
