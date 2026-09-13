import { DonateCheckout } from '@/features/donations/components/DonateCheckout'
import { OrganizationDonateCheckout } from '@/features/donations/components/OrganizationDonateCheckout'
import { getFontOption } from '../fontOptions'
import { cn } from '@/utils/cn'

// The actual themed donation flow -- reused by both DonateModal.jsx (the
// real overlay a public visitor sees) and Embed Studio's "Design Donation
// Flow" step (an always-visible, non-dismissible live preview of the same
// thing, styled the same way). One implementation so the two can never
// drift apart, same "one component, two call sites" convention EmbedGallery/
// FundraisingWidget already follow.
//
// `theme` is the embed's independent donation-flow appearance config (see
// defaultConfiguration.js's `donationFlow` shape / DonationFlowConfigForm.jsx).
// Blank fields mean "keep the app's own default styling." `onClose` is
// optional -- when present (the real modal), DonateCheckout/
// OrganizationDonateCheckout render their own Close button; omitted (the
// Studio's inline preview), there's nothing to dismiss.
export function DonationFlowPreview({ destination, embedId, theme, onClose, className }) {
  const fontOption = theme?.fontFamily ? getFontOption(theme.fontFamily) : null
  const style = {
    backgroundColor: theme?.backgroundColor || undefined,
    color: theme?.textColor || undefined,
    borderRadius: `${theme?.borderRadius ?? 16}px`,
    fontFamily: fontOption?.stack,
  }

  return (
    <div className={cn('bg-card border p-5', className)} style={style}>
      {fontOption?.googleFontFamily && (
        <link rel="stylesheet" href={`https://fonts.googleapis.com/css2?family=${fontOption.googleFontFamily}&display=swap`} />
      )}
      {destination.type === 'campaign' ? (
        <DonateCheckout campaign={destination} embedded embedId={embedId} theme={theme} onCancel={onClose} />
      ) : (
        <OrganizationDonateCheckout organization={destination} embedded embedId={embedId} theme={theme} onCancel={onClose} />
      )}
    </div>
  )
}
