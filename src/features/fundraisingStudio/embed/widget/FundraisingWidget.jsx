import { useState } from 'react'
import { ProgressBar } from '@/components/custom/ProgressBar'
import { formatGMD } from '@/utils/formatters'
import { cn } from '@/utils/cn'
import { mergeConfiguration } from '../defaultConfiguration'
import { DonateModal } from './DonateModal'

// The one widget implementation consumed by both Embed Studio's live
// preview (EmbedPreview.jsx) and the public /embed/$id page
// (EmbedWidgetPage.jsx) -- per the spec's "same component, different
// viewport containers" requirement, not two separate implementations that
// could drift apart.
//
// `interactive=false` (Studio preview only) renders the Donate control as
// a non-navigating look-alike instead of a real link -- clicking Donate in
// a live preview shouldn't navigate the Studio itself away.
export function FundraisingWidget({ embed, interactive = true }) {
  const { destination, layout, is_active: isActive } = embed
  const config = mergeConfiguration(embed.configuration)
  const title = config.content.title || destination.title
  const description = config.content.description || destination.description
  const isCampaign = destination.type === 'campaign'
  const [donateOpen, setDonateOpen] = useState(false)

  const containerStyle = {
    backgroundColor: config.appearance.backgroundColor || undefined,
    color: config.appearance.textColor || undefined,
    borderRadius: `${config.appearance.borderRadius ?? 12}px`,
  }
  // `bg-primary` (see index.css's `@utility bg-primary` override) sets the
  // brand *gradient* via the `background` shorthand, i.e. background-image,
  // not background-color -- a plain inline backgroundColor never overrides
  // that image layer, it just paints invisibly underneath it. backgroundImage:
  // 'none' is what actually lets a custom color show through.
  const buttonStyle = config.appearance.primaryColor
    ? { backgroundColor: config.appearance.primaryColor, backgroundImage: 'none', borderColor: config.appearance.primaryColor }
    : undefined

  if (!isActive) {
    return (
      <div className="p-4 rounded-xl border bg-muted text-center text-sm text-muted-foreground">
        This donation widget is no longer active.
      </div>
    )
  }

  const donateButton = (
    <DonateButton
      interactive={interactive}
      onClick={() => setDonateOpen(true)}
      label={config.content.donateButtonText || 'Donate'}
      style={buttonStyle}
    />
  )

  const progress = isCampaign && (
    <div className="space-y-1">
      <ProgressBar value={destination.raised} max={destination.goal} />
      <p className="text-xs opacity-80">
        {formatGMD(destination.raised)} raised of {formatGMD(destination.goal)}
      </p>
    </div>
  )

  let content
  if (layout === 'compact') {
    content = (
      <div style={containerStyle} className="p-3 rounded-xl border bg-card space-y-2 w-full max-w-sm">
        <p className="font-semibold text-sm truncate">{title}</p>
        {progress}
        {donateButton}
      </div>
    )
  } else if (layout === 'wide') {
    content = (
      <div style={containerStyle} className="p-4 rounded-xl border bg-card flex items-center gap-4 w-full">
        <div className="min-w-0 flex-1">
          <p className="font-semibold truncate">{title}</p>
          {description && <p className="text-xs opacity-70 truncate">{description}</p>}
        </div>
        {isCampaign && <div className="w-40 shrink-0">{progress}</div>}
        <div className="shrink-0">{donateButton}</div>
      </div>
    )
  } else if (layout === 'horizontal') {
    content = (
      <div style={containerStyle} className="p-4 rounded-xl border bg-card flex gap-4 w-full max-w-lg">
        <CoverThumbnail destination={destination} className="w-24 h-24 shrink-0" />
        <div className="min-w-0 flex-1 space-y-2">
          <p className="font-semibold truncate">{title}</p>
          {description && <p className="text-xs opacity-70 line-clamp-2">{description}</p>}
          {progress}
          {donateButton}
        </div>
      </div>
    )
  } else if (layout === 'progress_focused') {
    content = (
      <div style={containerStyle} className="p-5 rounded-xl border bg-card space-y-3 w-full max-w-sm text-center">
        <p className="font-semibold">{title}</p>
        {isCampaign ? (
          <>
            <p className="text-3xl font-bold">{formatGMD(destination.raised)}</p>
            <p className="text-xs opacity-70">raised of {formatGMD(destination.goal)} goal</p>
            <ProgressBar value={destination.raised} max={destination.goal} />
          </>
        ) : (
          description && <p className="text-sm opacity-80">{description}</p>
        )}
        {donateButton}
      </div>
    )
  } else {
    // 'card' (default)
    content = (
      <div style={containerStyle} className="rounded-xl border bg-card overflow-hidden w-full max-w-sm">
        <CoverThumbnail destination={destination} className="w-full aspect-video" />
        <div className="p-4 space-y-3">
          <div>
            <p className="font-semibold">{title}</p>
            {description && <p className="text-sm opacity-70 line-clamp-2 mt-0.5">{description}</p>}
          </div>
          {progress}
          {donateButton}
        </div>
      </div>
    )
  }

  return (
    <>
      {content}
      {/* Only ever reachable when interactive (the real public embed page --
          Studio's preview passes interactive=false and DonateButton renders
          a non-clickable span there, so donateOpen can never become true). */}
      {interactive && donateOpen && (
        <DonateModal destination={destination} embedId={embed.id} onClose={() => setDonateOpen(false)} />
      )}
    </>
  )
}

function CoverThumbnail({ destination, className }) {
  return (
    <div className={cn('bg-muted overflow-hidden', className)}>
      {destination.cover_image_url && (
        <img src={destination.cover_image_url} alt="" className="w-full h-full object-cover" />
      )}
    </div>
  )
}

function DonateButton({ interactive, onClick, label, style }) {
  const className = 'inline-flex items-center justify-center w-full px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity'
  if (!interactive) {
    return <span role="button" aria-disabled style={style} className={className}>{label}</span>
  }
  // Opens DonateModal (see FundraisingWidget above) instead of navigating --
  // the widget used to break out of its iframe with target="_top" straight
  // to the full-page /donate|give checkout; now the form itself renders in
  // place, and only the final payment-gateway handoff still leaves the
  // iframe (DonateCheckout.jsx/OrganizationDonateCheckout.jsx's own
  // window.top.location.href, once a payment_link comes back).
  return (
    <button type="button" onClick={onClick} style={style} className={className}>
      {label}
    </button>
  )
}
