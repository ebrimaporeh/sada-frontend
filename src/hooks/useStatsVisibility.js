import { useEffect, useState } from 'react'

// Tailwind's `sm` breakpoint -- matches how these same admin pages already
// split their stats grid layout (grid-cols-2 sm:grid-cols-4), so "mobile"
// here means the same thing it means everywhere else in this app.
const DESKTOP_BREAKPOINT_PX = 640
const STORAGE_PREFIX = 'admin-stats-visible:'

function prefersDesktopDefault() {
  if (typeof window === 'undefined') return true
  return window.matchMedia(`(min-width: ${DESKTOP_BREAKPOINT_PX}px)`).matches
}

// Persists an admin page's show/hide-stats toggle to localStorage, keyed by
// `pageKey` so choosing to hide stats on Campaigns doesn't also hide them
// on Donations. With no stored preference yet, defaults to visible on
// desktop and hidden on mobile -- on a small screen the stats grid is the
// first thing pushing the actual list/table below the fold.
export function useStatsVisibility(pageKey) {
  const storageKey = `${STORAGE_PREFIX}${pageKey}`

  const [visible, setVisible] = useState(() => {
    if (typeof window === 'undefined') return true
    const stored = window.localStorage.getItem(storageKey)
    return stored !== null ? stored === 'true' : prefersDesktopDefault()
  })

  useEffect(() => {
    window.localStorage.setItem(storageKey, String(visible))
  }, [storageKey, visible])

  return [visible, setVisible]
}
