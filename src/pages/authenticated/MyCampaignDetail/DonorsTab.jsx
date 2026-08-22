import { useState } from 'react'
import { Users, SearchX, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { formatGMD, timeAgo } from '@/utils/formatters'
import { useMyCampaignDonors } from '@/hooks/useDonations'

export function DonorsTab({ slug, donorsCount, totalRaised }) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useMyCampaignDonors(slug, { page })
  const donors = data?.donations ?? []
  const totalPages = data?.totalPages ?? 1

  const filtered = donors.filter((d) => {
    if (!search) return true
    const q = search.toLowerCase()
    const isAnon = d.is_anonymous ?? d.anonymous
    return (
      (!isAnon && (d.donor_name || d.donor || '').toLowerCase().includes(q)) ||
      (d.message && d.message.toLowerCase().includes(q))
    )
  })

  const anon = donors.filter((d) => d.is_anonymous ?? d.anonymous).length

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total donations', value: donorsCount ?? donors.length },
          { label: 'Total raised', value: formatGMD(totalRaised ?? 0) },
          { label: 'Anonymous (this page)', value: anon },
        ].map(({ label, value }) => (
          <div key={label} className="border rounded-xl p-4 bg-card text-center">
            <p className="text-xl font-extrabold">{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="Search donors or messages…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm bg-background focus:outline-hidden focus:ring-2 focus:ring-ring"
        />
        <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      </div>

      <div className="border rounded-2xl bg-card divide-y overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center">
            <SearchX className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No donors match your search.</p>
          </div>
        ) : (
          filtered.map((d) => {
            const isAnon = d.is_anonymous ?? d.anonymous
            const name = isAnon ? 'Anonymous' : (d.donor_name || d.donor || 'Unknown')
            return (
              <div key={d.id} className="flex items-start gap-3 px-5 py-4 hover:bg-muted/30 transition-colors">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                  {isAnon ? '?' : name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-sm">{name}</p>
                    <p className="font-bold text-primary text-sm flex-shrink-0">{formatGMD(d.amount)}</p>
                  </div>
                  {d.message && (
                    <p className="text-sm text-muted-foreground mt-1 italic">"{d.message}"</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">{timeAgo(d.paid_at || d.created_at || d.date)}</p>
                </div>
              </div>
            )
          })
        )}
      </div>

      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={!data?.hasPrevious}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border text-sm font-medium hover:bg-accent transition-colors disabled:opacity-40 disabled:pointer-events-none"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
          <span className="text-xs text-muted-foreground">Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={!data?.hasNext}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border text-sm font-medium hover:bg-accent transition-colors disabled:opacity-40 disabled:pointer-events-none"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
