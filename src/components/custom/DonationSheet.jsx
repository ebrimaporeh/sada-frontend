import { Sheet } from './Sheet'
import { formatGMD, formatDateTime } from '@/utils/formatters'

export function DonationSheet({
  isOpen,
  onClose,
  donation,
}) {
  if (!donation) return null

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title={`Donation: ${formatGMD(donation.amount)}`}
      footer={
        <button
          onClick={onClose}
          className="w-full px-4 py-2 rounded-lg border hover:bg-accent transition-colors text-sm font-medium"
        >
          Close
        </button>
      }
    >
      <div className="space-y-4">
        <div className="p-3 rounded-lg bg-muted/50 border">
          <label className="text-xs font-semibold text-muted-foreground block mb-1">AMOUNT</label>
          <p className="text-lg font-bold text-primary">{formatGMD(donation.amount)}</p>
        </div>

        <div className="p-3 rounded-lg bg-muted/50 border">
          <label className="text-xs font-semibold text-muted-foreground block mb-1">DONOR</label>
          <p className="text-sm font-medium">{donation.is_anonymous ? 'Anonymous' : (donation.donor_name || '—')}</p>
        </div>

        <div className="p-3 rounded-lg bg-muted/50 border">
          <label className="text-xs font-semibold text-muted-foreground block mb-1">CAMPAIGN</label>
          <p className="text-sm">{donation.campaign_title || '—'}</p>
        </div>

        <div className="p-3 rounded-lg bg-muted/50 border">
          <label className="text-xs font-semibold text-muted-foreground block mb-1">STATUS</label>
          <p className="text-sm capitalize font-medium">{donation.status || 'paid'}</p>
        </div>

        <div className="p-3 rounded-lg bg-muted/50 border">
          <label className="text-xs font-semibold text-muted-foreground block mb-1">PHONE</label>
          <p className="text-sm">{donation.phone || '—'}</p>
        </div>

        <div className="p-3 rounded-lg bg-muted/50 border">
          <label className="text-xs font-semibold text-muted-foreground block mb-1">DATE</label>
          <p className="text-sm">{formatDateTime(donation.paid_at || donation.created_at)}</p>
        </div>
      </div>
    </Sheet>
  )
}
