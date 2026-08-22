import { useEffect } from 'react'
import { useSiteSettings } from '@/hooks/useSiteSettings'

/** Swaps the browser-tab favicon to the admin-configured logo once site
 * settings load, replacing the static placeholder in index.html. Renders
 * nothing -- mounted once at the router root so it applies everywhere. */
export function SiteFavicon() {
  const { logo } = useSiteSettings()

  useEffect(() => {
    if (!logo) return
    let link = document.querySelector('link[rel="icon"]')
    if (!link) {
      link = document.createElement('link')
      link.setAttribute('rel', 'icon')
      document.head.appendChild(link)
    }
    link.removeAttribute('type') // was image/svg+xml for the static placeholder; the logo can be any format
    link.setAttribute('href', logo)
  }, [logo])

  return null
}
