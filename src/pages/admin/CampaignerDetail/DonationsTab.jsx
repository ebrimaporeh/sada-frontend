import { useState } from 'react'
import { Loader2, HandCoins } from 'lucide-react'
import { useAdminDonations } from '@/hooks/useDonations'
import { AdminPagination } from '@/components/custom/AdminPagination'
import { DonationSheet } from '@/components/custom/DonationSheet'
import { EmptyState } from '@/components/custom/EmptyState'
import { formatGMD, formatDateTime } from '@/utils/formatters'
import { DONATION_STATUS } from '@/constants'
import { cn } from '@/utils/cn'

const STATUS_COLORS = {
  [DONATION_STATUS.PAID]: 'bg-green-100 text-green-700',
  [DONATION_STATUS.PENDING]: 'bg-amber-100 text-amber-700',
  [DONATION_STATUS.FAILED]: 'bg-red-100 text-red-700',
  [DONATION_STATUS.REFUNDED]: 'bg-gray-100 text-gray-600',
}

export function DonationsTab({ user }) {
  const [page, setPage] = useState(1)
  const [selectedDonation, setSelectedDonation] = useState(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const limit = 10

  const { data, isLoading } = useAdminDonations({ donor: user.id, page, page_size: limit })
  const donations = data?.donations ?? []
  const totalPages = data?.totalPages ?? 1
  const totalCount = data?.count ?? 0

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (donations.length === 0) {
    return (
      <EmptyState
        icon={HandCoins}
        title="No donations yet"
        description={`${user.full_name || 'This user'} hasn't made a donation.`}
      />
    )
  }

  return (
    <div className="space-y-5">
      <div className="border rounded-2xl overflow-hidden bg-card divide-y">
        {donations.map((d) => (
          <div
            key={d.id}
            onClick={() => { setSelectedDonation(d); setIsSheetOpen(true) }}
            className="flex items-center justify-between gap-3 px-5 py-4 hover:bg-muted/30 transition-colors cursor-pointer"
          >
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate">{d.campaign_title}</p>
              <p className="text-xs text-muted-foreground">{formatDateTime(d.paid_at ?? d.created_at)}</p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="font-bold text-primary text-sm">{formatGMD(d.amount)}</span>
              <span className={cn('text-xs font-semibold px-2 py-1 rounded-full capitalize', STATUS_COLORS[d.status] || 'bg-gray-100 text-gray-600')}>
                {d.status ?? 'paid'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {donations.length > 0 && (
        <AdminPagination page={page} totalPages={totalPages} onPageChange={setPage} totalCount={totalCount} limit={limit} />
      )}

      <DonationSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        donation={selectedDonation}
      />
    </div>
  )
}
