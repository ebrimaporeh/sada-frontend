import { useEffect, useState } from 'react'

const STORAGE_KEY = 'sidebar-collapsed'

// Persists the authenticated layout's desktop sidebar collapsed (icon-only)
// state across reloads -- same raw-string localStorage pattern as
// useStatsVisibility.js. Desktop-only concept; the mobile slide-over
// drawer always renders full-width regardless of this value.
export function useSidebarCollapsed() {
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.localStorage.getItem(STORAGE_KEY) === 'true'
  })

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, String(collapsed))
  }, [collapsed])

  return [collapsed, setCollapsed]
}
