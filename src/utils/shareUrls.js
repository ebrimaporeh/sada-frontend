import { settings } from '@/settings'

// Points at the backend's server-rendered preview pages (apps/seo), not the
// SPA route directly -- see usePageMeta.js for why a client-rendered SPA
// can't give WhatsApp/Facebook/LinkedIn's crawlers a real preview on its
// own. Each of these instantly redirects a real visitor on to the actual
// app page; crawlers just read the tags and stop there.
export function campaignShareUrl(slug) {
  return `${settings.apiOrigin}/share/campaigns/${slug}/`
}

export function campaignerShareUrl(id) {
  return `${settings.apiOrigin}/share/campaigners/${id}/`
}
