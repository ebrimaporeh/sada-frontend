import { useState } from 'react'
import { Search, Loader2, SearchX, Eye, EyeOff, ChevronLeft, ChevronRight } from 'lucide-react'
import { PageHeader } from '@/components/custom/PageHeader'
import { formatGMD, formatDateTime } from '@/utils/formatters'
import { useAdminDonations } from '@/hooks/useDonations'
import { useDonationsStats } from '@/hooks/useAdmin'
import { StatSkeleton } from '@/components/custom/StatSkeleton'
import { DONATION_STATUS } from '@/constants'
import { cn } from '@/utils/cn'

const STATUS_COLORS = {
  [DONATION_STATUS.PAID]: 'bg-green-100 text-green-700',
  [DONATION_STATUS.PENDING]: 'bg-amber-100 text-amber-700',
  [DONATION_STATUS.FAILED]: 'bg-red-100 text-red-700',
  [DONATION_STATUS.REFUNDED]: 'bg-gray-100 text-gray-600',
}

export function DonationsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [showStats, setShowStats] = useState(true)
  const limit = 10

  const { data: statsData, isLoading: statsLoading } = useDonationsStats()
  const { data, isLoading } = useAdminDonations()
  const allDonations = data?.donations ?? []

  const donations = allDonations.filter((d) => {
    const donorName = d.donor_name ?? d.donor ?? ''
    const campaignTitle = d.campaign_title ?? d.campaign ?? ''
    const isAnon = d.is_anonymous ?? d.anonymous ?? false
    const matchSearch = !search ||
      (!isAnon && donorName.toLowerCase().includes(search.toLowerCase())) ||
      campaignTitle.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || d.status === statusFilter
    return matchSearch && matchStatus
  })

  const totalPages = Math.ceil(donations.length / limit)
  const paginatedDonations = donations.slice((page - 1) * limit, page * limit)
  const statuses = ['all', DONATION_STATUS.PAID, DONATION_STATUS.PENDING, DONATION_STATUS.FAILED, DONATION_STATUS.REFUNDED]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Donations"
          description={`${allDonations.length} total donations processed`}
        />
        <button
          onClick={() => setShowStats(!showStats)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-sm font-medium"
        >
          {showStats ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {showStats ? 'Hide Stats' : 'Show Stats'}
        </button>
      </div>

      {/* Stats Grid */}
      {showStats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {statsLoading ? (
            <>
              <StatSkeleton />
              <StatSkeleton />
              <StatSkeleton />
              <StatSkeleton />
            </>
          ) : (
            <>
              <div className="border rounded-xl p-4 bg-card">
                <p className="text-xl font-extrabold text-primary">{formatGMD(statsData?.total_raised || 0)}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Total Received</p>
              </div>
              <div className="border rounded-xl p-4 bg-card">
                <p className="text-xl font-extrabold text-foreground">{statsData?.total_donations || 0}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Total Donations</p>
              </div>
              <div className="border rounded-xl p-4 bg-card">
                <p className="text-xl font-extrabold text-green-600">{formatGMD(statsData?.average_donation || 0)}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Avg Donation</p>
              </div>
              <div className="border rounded-xl p-4 bg-card">
                <p className="text-xl font-extrabold text-muted-foreground">{statsData?.anonymous_count || 0}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Anonymous</p>
              </div>
            </>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search donor or campaign..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
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

      <div className="border rounded-xl overflow-hidden bg-card">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead className="border-b bg-muted/50">
                <tr>
                  {['Donor', 'Campaign', 'Amount', 'Status', 'Date'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {paginatedDonations.map((d) => {
                  const isAnon = d.is_anonymous ?? d.anonymous ?? false
                  const donorName = d.donor_name ?? d.donor ?? 'Anonymous'
                  const campaignTitle = d.campaign_title ?? d.campaign ?? '—'
                  const date = d.paid_at ?? d.created_at ?? d.date
                  return (
                    <tr key={d.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                            {isAnon ? '?' : donorName[0]}
                          </div>
                          <span className="font-medium">{isAnon ? 'Anonymous' : donorName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground max-w-[200px]">
                        <p className="line-clamp-1">{campaignTitle}</p>
                      </td>
                      <td className="px-4 py-3 font-bold text-primary">{formatGMD(d.amount)}</td>
                      <td className="px-4 py-3">
                        <span className={cn('text-xs font-semibold px-2 py-1 rounded-full capitalize', STATUS_COLORS[d.status] || 'bg-gray-100 text-gray-600')}>
                          {d.status ?? 'paid'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{formatDateTime(date)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
        {!isLoading && donations.length === 0 && (
          <div className="py-16 text-center">
            <SearchX className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No donations match your filters.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {donations.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages} · Showing {((page - 1) * limit) + 1}-{Math.min(page * limit, donations.length)} of {donations.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg border hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                    p === page
                      ? 'bg-primary text-primary-foreground'
                      : 'border hover:bg-accent'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg border hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
