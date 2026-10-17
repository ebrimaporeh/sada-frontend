// Points at the backend's server-rendered preview pages (apps/seo), not the
// SPA route directly -- see usePageMeta.js for why a client-rendered SPA
// can't give WhatsApp/Facebook/LinkedIn's crawlers a real preview on its
// own. Each of these instantly redirects a real visitor on to the actual
// app page; crawlers just read the tags and stop there.
//
// Built on window.location.origin, not settings.apiOrigin -- the copied/
// shared link text should read as this site's own domain, not the API's.
// vercel.json's /share/:path* rewrite transparently proxies these paths to
// the backend, so the browser (and whoever the link gets shared to) never
// sees api.dolelma.org at all, even though apps/seo is what actually
// renders the page behind the scenes.
export function campaignShareUrl(slug) {
  return `${window.location.origin}/share/campaigns/${slug}/`
}

export function fundraiserShareUrl(id) {
  return `${window.location.origin}/share/fundraisers/${id}/`
}
