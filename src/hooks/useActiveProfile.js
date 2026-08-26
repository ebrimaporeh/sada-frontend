import { useEffect } from 'react'
import { useMe } from '@/hooks/useAuth'
import { useProfileSwitchStore } from '@/store/profileSwitchStore'
import { useActiveProfileStore, INDIVIDUAL_PROFILE_ID } from '@/store/activeProfileStore'

// Re-exported so existing `import { INDIVIDUAL_PROFILE_ID } from
// '@/hooks/useActiveProfile'` call sites (e.g. ProfileSwitcher) don't need
// to change now that the id itself lives in the store -- see there for why.
export { INDIVIDUAL_PROFILE_ID }

// Purely a transition beat (see ProfileSwitchOverlay) -- switching profile
// itself is instant (everything needed is already in the me cache), this
// just gives the switch a moment to register visually instead of the nav/
// page content silently jumping to a different context.
const SWITCH_OVERLAY_DURATION_MS = 700

// Pure client-side "which hat am I acting as right now" — the backend has
// no session/JWT concept of this, every write that needs org context (e.g.
// campaign creation) just carries an explicit organization_id, same as
// every other per-request param in this codebase (see
// .claude/frontend/api-integration.md). Persisted in localStorage as a
// plain string, same convention as access_token/useStatsVisibility (see
// .claude/frontend/state-management.md) rather than JSON-encoded via
// storage.js, since the value is always a bare id string.
//
// Scope of what "active profile" actually gates: which org context a *new*
// campaign is created under, and which org's verification/settings render
// on pages that don't otherwise have an org in view (VerificationPage,
// the dashboard greeting). It deliberately does NOT gate whether you can
// edit/pause/withdraw an *existing* campaign you already have access to —
// that's checked against your real membership permissions for that
// specific campaign's organization (see useCampaignOrgPermission), so
// switching your active profile to "Individual" to glance at the dashboard
// doesn't lock you out of acting on an org campaign in your list.
export function useActiveProfile() {
  const { data: me } = useMe()
  const organizations = me?.organizations ?? []

  const profileId = useActiveProfileStore((s) => s.profileId)
  const setProfileId = useActiveProfileStore((s) => s.setProfileId)

  const activeOrg = profileId === INDIVIDUAL_PROFILE_ID
    ? null
    : organizations.find((o) => o.id === profileId) || null

  // If the stored profile points at an org the user is no longer a member
  // of (removed, left, or just never loaded yet), fall back to Individual
  // rather than silently gating everything as if they had zero permissions.
  useEffect(() => {
    if (!me) return
    if (profileId !== INDIVIDUAL_PROFILE_ID && !activeOrg) {
      setProfileId(INDIVIDUAL_PROFILE_ID)
    }
  }, [me, profileId, activeOrg, setProfileId])

  function setProfile(id) {
    const target = id === INDIVIDUAL_PROFILE_ID
      ? { label: 'Personal account', isOrg: false }
      : { label: organizations.find((o) => o.id === id)?.organization_name || 'organization', isOrg: true }
    useProfileSwitchStore.getState().startSwitch(target)
    setProfileId(id)
    setTimeout(() => useProfileSwitchStore.getState().endSwitch(), SWITCH_OVERLAY_DURATION_MS)
  }

  const isOrg = Boolean(activeOrg)
  const permissions = activeOrg?.permissions ?? []

  // Individual profile isn't permission-gated at all -- you either own a
  // campaign outright or you don't (identical to pre-org-model behavior).
  function hasPermission(permission) {
    return isOrg ? permissions.includes(permission) : true
  }

  return {
    profileId,
    isOrg,
    organization: activeOrg,
    organizations,
    permissions,
    hasPermission,
    setProfile,
  }
}
