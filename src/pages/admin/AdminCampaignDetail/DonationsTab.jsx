import { useEffect, useState } from 'react'
import { Search, Loader2, SearchX } from 'lucide-react'
import { useAdminDonations } from '@/hooks/useDonations'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { AdminPagination } from '@/components/custom/AdminPagination'
import { DonationSheet } from '@/components/custom/DonationSheet'
import { formatGMD, formatDateTime } from '@/utils/formatters'
import { DONATION_STATUS } from '@/constants'
import { cn } from '@/utils/cn'

const STATUS_COLORS = {
  [DONATION_STATUS.PAID]: 'bg-green-100 text-green-700',
  [DONATION_STATUS.PENDING]: 'bg-amber-100 text-amber-700',
  [DONATION_STATUS.FAILED]: 'bg-red-100 text-red-700',
  [DONATION_STATUS.REFUNDED]: 'bg-gray-100 text-gray-600',
}

export function DonationsTab({ campaign }) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [selectedDonation, setSelectedDonation] = useState(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const limit = 10

  const debouncedSearch = useDebouncedValue(search)

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, statusFilter])

  const { data, isLoading } = useAdminDonations({
    campaign: campaign.id,
    page,
    page_size: limit,
    status: statusFilter === 'all' ? undefined : statusFilter,
    search: debouncedSearch || undefined,
  })
  const donations = data?.donations ?? []
  const totalPages = data?.totalPages ?? 1
  const totalCount = data?.count ?? 0
  const statuses = ['all', DONATION_STATUS.PAID, DONATION_STATUS.PENDING, DONATION_STATUS.FAILED, DONATION_STATUS.REFUNDED]

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search donor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm bg-background focus:outline-hidden focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                'text-xs px-3 py-1.5 rounded-full border font-medium capitalize transition-colors',
                statusFilter === s ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-accent',
              )}
            >
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>
      </div>

      <div className="border rounded-2xl overflow-hidden bg-card">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : donations.length === 0 ? (
          <div className="py-16 text-center">
            <SearchX className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No donations match your filters.</p>
          </div>
        ) : (
          <div className="divide-y">
            {donations.map((d) => {
              const isAnon = d.is_anonymous ?? false
              const donorName = d.donor_name ?? 'Anonymous'
              return (
                <div
                  key={d.id}
                  onClick={() => { setSelectedDonation(d); setIsSheetOpen(true) }}
                  className="flex items-center justify-between gap-3 px-5 py-4 hover:bg-muted/30 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                      {isAnon ? '?' : donorName[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm">{isAnon ? 'Anonymous' : donorName}</p>
                      <p className="text-xs text-muted-foreground">{formatDateTime(d.paid_at ?? d.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="font-bold text-primary text-sm">{formatGMD(d.amount)}</span>
                    <span className={cn('text-xs font-semibold px-2 py-1 rounded-full capitalize', STATUS_COLORS[d.status] || 'bg-gray-100 text-gray-600')}>
                      {d.status ?? 'paid'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
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
