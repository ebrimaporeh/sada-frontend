import { create } from 'zustand'

// The one piece of state genuinely needed across components for this:
// ProfileSwitcher (and OrganizationNewPage, which also calls setProfile
// after creating an org) trigger a switch, while a single overlay mounted
// once in AuthenticatedLayout renders it -- neither React Query's cache
// (this isn't server data) nor localStorage (this is transient, not meant
// to survive a reload) fits, so this is the documented case for reaching
// for zustand (see .claude/frontend/state-management.md) rather than prop
// drilling between two components that aren't parent/child.
export const useProfileSwitchStore = create((set) => ({
  switchingTo: null, // null | { label: string, isOrg: boolean }
  startSwitch: (target) => set({ switchingTo: target }),
  endSwitch: () => set({ switchingTo: null }),
}))
