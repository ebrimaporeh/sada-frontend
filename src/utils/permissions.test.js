import { describe, it, expect } from 'vitest'
import {
  Resource, hasResourceAccess, isAdminAreaRole, landingRouteForResources, roleLabel, roleBadgeClass,
} from './permissions'
import { ROLES, ROUTES } from '@/constants'

describe('hasResourceAccess', () => {
  it('is true when the resource is in the list', () => {
    expect(hasResourceAccess([Resource.USERS_VIEW, Resource.STAFF_VIEW], Resource.STAFF_VIEW)).toBe(true)
  })

  it('is false when it is not', () => {
    expect(hasResourceAccess([Resource.USERS_VIEW], Resource.STAFF_VIEW)).toBe(false)
  })

  it('is false for a missing or non-array resources value', () => {
    expect(hasResourceAccess(undefined, Resource.USERS_VIEW)).toBe(false)
    expect(hasResourceAccess(null, Resource.USERS_VIEW)).toBe(false)
  })
})

describe('isAdminAreaRole', () => {
  it('admin always qualifies, regardless of resources', () => {
    expect(isAdminAreaRole({ role: ROLES.ADMIN, resources: [] })).toBe(true)
  })

  it('a non-admin with at least one granted resource qualifies', () => {
    expect(isAdminAreaRole({ role: 'moderator', resources: [Resource.CATEGORIES_VIEW] })).toBe(true)
  })

  it('a brand-new role with zero grants does not yet qualify', () => {
    expect(isAdminAreaRole({ role: 'brand-new-role', resources: [] })).toBe(false)
  })

  it('a plain user does not qualify', () => {
    expect(isAdminAreaRole({ role: ROLES.USER, resources: [] })).toBe(false)
  })

  it('handles a missing user', () => {
    expect(isAdminAreaRole(null)).toBe(false)
    expect(isAdminAreaRole(undefined)).toBe(false)
  })
})

describe('landingRouteForResources', () => {
  it('lands on the dashboard when the user can view it', () => {
    expect(landingRouteForResources([Resource.DASHBOARD_VIEW])).toBe('/admin')
  })

  it('falls through in priority order to the first resource actually held', () => {
    // No dashboard access, but campaigns -- should land there, not on donations.
    expect(landingRouteForResources([Resource.DONATIONS_VIEW, Resource.CAMPAIGNS_VIEW])).toBe(ROUTES.ADMIN_CAMPAIGNS)
  })

  it('falls back to the regular dashboard route when nothing matches', () => {
    expect(landingRouteForResources([])).toBe(ROUTES.DASHBOARD)
    expect(landingRouteForResources(undefined)).toBe(ROUTES.DASHBOARD)
  })
})

describe('roleLabel', () => {
  it('uses the fixed label for admin/user without needing the live catalog', () => {
    expect(roleLabel(ROLES.ADMIN, [])).toBe('Admin')
    expect(roleLabel(ROLES.USER, [])).toBe('User')
  })

  it('looks up a custom role from the live roles list', () => {
    const dynamicRoles = [{ role: 'content-reviewer', label: 'Content Reviewer', resources: [] }]
    expect(roleLabel('content-reviewer', dynamicRoles)).toBe('Content Reviewer')
  })

  it('falls back to the raw slug for an unknown role', () => {
    expect(roleLabel('mystery-role', [])).toBe('mystery-role')
  })
})

describe('roleBadgeClass', () => {
  it('gives admin a fixed color', () => {
    expect(roleBadgeClass(ROLES.ADMIN)).toBe('bg-purple-100 text-purple-700')
  })

  it('is deterministic for the same role slug', () => {
    expect(roleBadgeClass('moderator')).toBe(roleBadgeClass('moderator'))
  })

  it('picks from the palette, not the admin color, for a non-admin role', () => {
    expect(roleBadgeClass('finance_officer')).not.toBe('bg-purple-100 text-purple-700')
  })
})
