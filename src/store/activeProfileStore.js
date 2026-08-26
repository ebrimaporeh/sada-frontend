import { create } from 'zustand'

const STORAGE_KEY = 'active_profile_id'
export const INDIVIDUAL_PROFILE_ID = 'individual'

// Which "hat" (personal account vs an organization) the signed-in user is
// acting as right now. Persisted as a plain localStorage string, same
// convention as access_token (see .claude/frontend/state-management.md) --
// but the *live* value has to be zustand, not a per-component useState.
// useActiveProfile() is called independently by several components
// (ProfileSwitcher, which calls setProfile; AuthenticatedLayout, which
// reads isOrg for nav items; CampaignForm; VerificationPage; ...) --
// component-local state meant each of those held its own copy, so
// switching profile in one place silently left every other consumer
// showing the old profile (nav items included) until a hard reload
// remounted everything. A shared store means every consumer re-renders
// off the same value.
export const useActiveProfileStore = create((set) => ({
  profileId: localStorage.getItem(STORAGE_KEY) || INDIVIDUAL_PROFILE_ID,
  setProfileId: (id) => {
    localStorage.setItem(STORAGE_KEY, id)
    set({ profileId: id })
  },
}))
