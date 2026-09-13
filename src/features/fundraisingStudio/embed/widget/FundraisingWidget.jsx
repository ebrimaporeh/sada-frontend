import { useState } from 'react'
import { ProgressBar } from '@/components/custom/ProgressBar'
import { formatGMD } from '@/utils/formatters'
import { cn } from '@/utils/cn'
import { mergeConfiguration } from '../defaultConfiguration'
import { DonateModal } from './DonateModal'

// Renders exactly one destination's card -- consumed by EmbedGallery.jsx,
// which maps embed.destinations to one of these each (per the spec's "same
// component, different viewport containers" requirement extended to "same
// component, one per gallery item", not a separate implementation per
// call site). `embed` supplies the shared layout/configuration; `destination`
// is the one item this particular card renders -- callers resolve which
// destination that is (EmbedGallery iterates embed.destinations).
//
// `interactive=false` renders the Donate control as a non-clickable
// look-alike instead of a real button -- nothing currently passes this
// (Studio's preview and the public page are both interactive: true, since
// DonateModal is an in-place overlay, not a navigation, so there's no
// reason to block it in Studio), but it stays a real, tested mode in case
// a future call site needs a purely static render.
//
// Doesn't check embed.is_active itself -- EmbedGallery checks that once,
// gallery-wide, before ever rendering a card.
export function FundraisingWidget({ embed, destination, interactive = true }) {
  const { layout } = embed
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
  // 'none' is what actually lets a custom color show through. buttonRadius
  // applies regardless of a custom color being set -- it's independent of
  // the card's own borderRadius (see defaultConfiguration.js).
  const buttonStyle = {
    borderRadius: `${config.appearance.buttonRadius ?? 8}px`,
    ...(config.appearance.buttonColor
      ? { backgroundColor: config.appearance.buttonColor, backgroundImage: 'none', borderColor: config.appearance.buttonColor }
      : {}),
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
        <CoverThumbnail destination={destination} className="w-24 h-24 shrink-0" radius={containerStyle.borderRadius} />
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
        <CoverThumbnail
          destination={destination}
          className="w-full aspect-video"
          topRadius={containerStyle.borderRadius}
        />
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
      {/* Only ever reachable when interactive -- with interactive=false,
          DonateButton renders a non-clickable span, so donateOpen can
          never become true. Both real call sites (Studio's preview and
          the public page) pass interactive=true today. */}
      {interactive && donateOpen && (
        <DonateModal destination={destination} embedId={embed.id} theme={config.donationFlow} onClose={() => setDonateOpen(false)} />
      )}
    </>
  )
}

// `radius` (all four corners, e.g. the horizontal layout's standalone
// square thumbnail) / `topRadius` (top corners only, e.g. the card
// layout's thumbnail sitting above a square-cornered content section)
// apply the exact same borderRadius the card itself uses, set directly on
// this element rather than left to the parent's overflow-hidden to clip --
// relying purely on a parent clip (as this used to) leaves a visible seam
// at the rounded corners where the parent's `border` meets the child
// image's still-square corner, since the two aren't clipped in exactly the
// same pass. Declaring the same radius here removes that seam entirely.
function CoverThumbnail({ destination, className, radius, topRadius }) {
  const style = topRadius != null
    ? { borderTopLeftRadius: topRadius, borderTopRightRadius: topRadius }
    : radius != null
      ? { borderRadius: radius }
      : undefined
  return (
    <div className={cn('bg-muted overflow-hidden', className)} style={style}>
      {destination.cover_image_url && (
        <img src={destination.cover_image_url} alt="" className="w-full h-full object-cover block" />
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
