import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Sheet } from './Sheet'
import { formatGMD, formatDateTime } from '@/utils/formatters'
import { useAdminRefundDonation } from '@/hooks/useDonations'
import { DONATION_STATUS } from '@/constants'

export function DonationSheet({
  isOpen,
  onClose,
  donation,
}) {
  const [isRefundMode, setIsRefundMode] = useState(false)
  const [refundReason, setRefundReason] = useState('')
  const { mutate: refundDonation, isPending: isRefunding, error: refundError } = useAdminRefundDonation()

  if (!donation) return null

  const canRefund = donation.status === DONATION_STATUS.PAID

  const handleClose = () => {
    setIsRefundMode(false)
    setRefundReason('')
    onClose()
  }

  const handleRefund = () => {
    refundDonation(
      { id: donation.id, reason: refundReason },
      { onSuccess: handleClose },
    )
  }

  return (
    <Sheet
      isOpen={isOpen}
      onClose={handleClose}
      title={`Donation: ${formatGMD(donation.amount)}`}
      footer={
        isRefundMode ? (
          <div className="flex gap-2 w-full">
            <button
              onClick={() => setIsRefundMode(false)}
              disabled={isRefunding}
              className="flex-1 px-4 py-2 rounded-lg border hover:bg-accent transition-colors text-sm font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleRefund}
              disabled={isRefunding}
              className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white transition-colors text-sm font-medium flex items-center justify-center gap-2"
            >
              {isRefunding ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {isRefunding ? 'Refunding...' : 'Confirm Refund'}
            </button>
          </div>
        ) : (
          <div className="flex gap-2 w-full">
            {canRefund && (
              <button
                onClick={() => setIsRefundMode(true)}
                className="flex-1 px-4 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors text-sm font-medium"
              >
                Refund Donation
              </button>
            )}
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2 rounded-lg border hover:bg-accent transition-colors text-sm font-medium"
            >
              Close
            </button>
          </div>
        )
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

        {donation.status === DONATION_STATUS.REFUNDED && donation.refund_reason && (
          <div className="p-3 rounded-lg bg-muted/50 border">
            <label className="text-xs font-semibold text-muted-foreground block mb-1">REFUND REASON</label>
            <p className="text-sm">{donation.refund_reason}</p>
          </div>
        )}

        {isRefundMode && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200">
            <label className="text-xs font-semibold text-red-700 block mb-1.5">
              REASON FOR REFUND (OPTIONAL)
            </label>
            <textarea
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              disabled={isRefunding}
              placeholder="e.g. 'Duplicate charge reported by donor'"
              className="w-full px-3 py-2 border border-red-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-red-500 bg-white resize-none disabled:opacity-50"
              rows="2"
            />
            <p className="text-xs text-red-700 mt-2">
              This will reverse the charge with the payment provider and reduce the campaign's raised total. This cannot be undone.
            </p>
            {refundError && (
              <p className="text-xs text-red-800 font-medium mt-2">
                {refundError?.response?.data?.message || 'Refund failed. Please try again.'}
              </p>
            )}
          </div>
        )}
      </div>
    </Sheet>
  )
}
