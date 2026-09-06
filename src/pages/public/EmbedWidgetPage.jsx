import { useEffect, useRef } from 'react'
import { useParams } from '@tanstack/react-router'
import { LoadingSpinner } from '@/components/custom/LoadingSpinner'
import { usePublicEmbed } from '@/hooks/useEmbeds'
import { useTrackEvent } from '@/hooks/useEvents'
import { FundraisingWidget } from '@/features/fundraisingStudio/embed/widget/FundraisingWidget'

// Backs /embed/$id -- the actual iframe-embeddable page installed on a
// third-party site. Deliberately NOT under PublicLayout (no header/footer/
// nav chrome, see rootRoute.jsx) since it's meant to look native inside
// someone else's page, not like a page of this app. Renders the exact same
// FundraisingWidget component the Embed Studio's live preview uses.
export function EmbedWidgetPage() {
  const { id } = useParams({ strict: false })
  const { embed, isLoading, error } = usePublicEmbed(id)
  const trackEvent = useTrackEvent()
  const hasTrackedView = useRef(false)

  // Iframes have no natural "fit content" sizing -- a fully transparent
  // body keeps the widget looking native regardless of the embedding
  // site's own background.
  useEffect(() => {
    document.body.style.background = 'transparent'
    return () => { document.body.style.background = '' }
  }, [])

  // Fire once per widget load, only once real (active) embed data is in --
  // reuses the existing product-engagement events pipeline (apps.events),
  // not a new analytics endpoint. A dropped/failed beacon is never
  // surfaced to the visitor; see useTrackEvent's own docstring.
  useEffect(() => {
    if (!embed || !embed.is_active || hasTrackedView.current) return
    hasTrackedView.current = true
    trackEvent.mutate({
      type: 'embed_viewed',
      campaignSlug: embed.destination?.type === 'campaign' ? embed.destination.slug : undefined,
      metadata: { embed_id: embed.id, source: 'embed', destination_type: embed.destination?.type },
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [embed])

  if (isLoading) {
    return (
      <div className="min-h-[200px] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (error || !embed) {
    return (
      <div className="min-h-[200px] flex items-center justify-center p-4 text-center text-sm text-muted-foreground">
        This embed is unavailable.
      </div>
    )
  }

  return (
    <div className="p-3 flex justify-center">
      <FundraisingWidget embed={embed} interactive />
    </div>
  )
}
