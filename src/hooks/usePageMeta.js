import { useEffect } from 'react'
import { useSiteSettings } from '@/hooks/useSiteSettings'

function upsertMeta(attrName, attrValue, content) {
  if (!content) return
  let el = document.querySelector(`meta[${attrName}="${attrValue}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attrName, attrValue)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertLink(rel, href) {
  if (!href) return
  let el = document.querySelector(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

/**
 * Sets the document title and social/search meta tags for the current
 * page (browser tab, Google's own indexing, in-app navigation).
 *
 * This does NOT reach WhatsApp/Facebook/LinkedIn/Slack's link-preview
 * crawlers -- they read a page's initial HTML only and never execute this
 * (or any) JS, so a client-side tag update is invisible to them. Sharing a
 * campaign/fundraiser/vision-topic link uses a backend-rendered preview
 * URL instead (see ShareCampaign's `url` prop and apps/seo on the
 * backend), which is the actual fix for those. This hook is the other
 * half: everything a real visitor's browser and Google itself see.
 */
export function usePageMeta({ title, description, image, type = 'website', url, noindex = false }) {
  const { siteName, siteDescription } = useSiteSettings()

  useEffect(() => {
    const fullTitle = title ? `${title} — ${siteName}` : siteName
    const finalDescription = description || siteDescription
    const canonicalUrl = url || window.location.href

    document.title = fullTitle

    upsertMeta('name', 'description', finalDescription)
    upsertMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow')
    upsertLink('canonical', canonicalUrl)

    upsertMeta('property', 'og:title', title || siteName)
    upsertMeta('property', 'og:description', finalDescription)
    upsertMeta('property', 'og:type', type)
    upsertMeta('property', 'og:site_name', siteName)
    upsertMeta('property', 'og:url', canonicalUrl)
    if (image) upsertMeta('property', 'og:image', image)

    upsertMeta('name', 'twitter:card', image ? 'summary_large_image' : 'summary')
    upsertMeta('name', 'twitter:title', title || siteName)
    upsertMeta('name', 'twitter:description', finalDescription)
    if (image) upsertMeta('name', 'twitter:image', image)
  }, [title, description, image, type, url, noindex, siteName, siteDescription])
}
