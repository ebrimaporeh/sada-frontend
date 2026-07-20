import { useEffect, useState } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'
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
  const [refunded, setRefunded] = useState(null)
  const { mutate: refundDonation, isPending: isRefunding, error: refundError, reset: resetRefund } = useAdminRefundDonation()

  // This component never unmounts between donations (DonationsPage keeps it
  // mounted, only Sheet toggles visibility) -- without this, refund mode,
  // the typed reason, a lingering success banner, or a stale mutation error
  // from whichever donation was open previously would all bleed into the
  // next one selected.
  useEffect(() => {
    setIsRefundMode(false)
    setRefundReason('')
    setRefunded(null)
    resetRefund()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [donation?.id])

  if (!donation) return null

  const view = refunded || donation
  const canRefund = view.status === DONATION_STATUS.PAID

  const handleRefund = () => {
    // ModemPay refunds are a slow, real-money network call (observed 4-5s)
    // -- isPending only flips true after a render, so guard against an
    // impatient double-click firing a second request before that.
    if (isRefunding) return
    refundDonation(
      { id: donation.id, reason: refundReason },
      {
        onSuccess: (res) => {
          setIsRefundMode(false)
          setRefunded(res?.data?.donation || null)
        },
      },
    )
  }

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title={`Donation: ${formatGMD(view.amount)}`}
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
                onClick={() => { resetRefund(); setIsRefundMode(true) }}
                className="flex-1 px-4 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors text-sm font-medium"
              >
                Refund Donation
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border hover:bg-accent transition-colors text-sm font-medium"
            >
              Close
            </button>
          </div>
        )
      }
    >
      <div className="space-y-4">
        {refunded && (
          <div className="p-3 rounded-lg bg-green-50 border border-green-200 flex items-center gap-2 text-sm font-medium text-green-700">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> Donation refunded successfully
          </div>
        )}

        <div className="p-3 rounded-lg bg-muted/50 border">
          <label className="text-xs font-semibold text-muted-foreground block mb-1">AMOUNT</label>
          <p className="text-lg font-bold text-primary">{formatGMD(view.amount)}</p>
        </div>

        <div className="p-3 rounded-lg bg-muted/50 border">
          <label className="text-xs font-semibold text-muted-foreground block mb-1">DONOR</label>
          <p className="text-sm font-medium">{view.is_anonymous ? 'Anonymous' : (view.donor_name || '—')}</p>
        </div>

        <div className="p-3 rounded-lg bg-muted/50 border">
          <label className="text-xs font-semibold text-muted-foreground block mb-1">CAMPAIGN</label>
          <p className="text-sm">{view.campaign_title || '—'}</p>
        </div>

        <div className="p-3 rounded-lg bg-muted/50 border">
          <label className="text-xs font-semibold text-muted-foreground block mb-1">STATUS</label>
          <p className="text-sm capitalize font-medium">{view.status || 'paid'}</p>
        </div>

        <div className="p-3 rounded-lg bg-muted/50 border">
          <label className="text-xs font-semibold text-muted-foreground block mb-1">PHONE</label>
          <p className="text-sm">{view.phone || '—'}</p>
        </div>

        <div className="p-3 rounded-lg bg-muted/50 border">
          <label className="text-xs font-semibold text-muted-foreground block mb-1">DATE</label>
          <p className="text-sm">{formatDateTime(view.paid_at || view.created_at)}</p>
        </div>

        {view.status === DONATION_STATUS.REFUNDED && view.refund_reason && (
          <div className="p-3 rounded-lg bg-muted/50 border">
            <label className="text-xs font-semibold text-muted-foreground block mb-1">REFUND REASON</label>
            <p className="text-sm">{view.refund_reason}</p>
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
