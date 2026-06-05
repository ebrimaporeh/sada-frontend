import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { CheckCircle2, XCircle, Eye, Search, Loader2, SearchX } from 'lucide-react'
import { PageHeader } from '@/components/custom/PageHeader'
import { ProgressBar } from '@/components/custom/ProgressBar'
import { formatGMD, formatDate, progressPercent } from '@/utils/formatters'
import { useAdminCampaigns, useAdminCampaignAction } from '@/hooks/useCampaigns'
import { CAMPAIGN_STATUS } from '@/constants'
import { cn } from '@/utils/cn'

const STATUS_COLORS = {
  [CAMPAIGN_STATUS.ACTIVE]: 'bg-green-100 text-green-700',
  [CAMPAIGN_STATUS.PENDING]: 'bg-amber-100 text-amber-700',
  [CAMPAIGN_STATUS.DRAFT]: 'bg-gray-100 text-gray-600',
  [CAMPAIGN_STATUS.COMPLETED]: 'bg-blue-100 text-blue-700',
  [CAMPAIGN_STATUS.REJECTED]: 'bg-red-100 text-red-700',
  [CAMPAIGN_STATUS.SUSPENDED]: 'bg-orange-100 text-orange-700',
  approved: 'bg-teal-100 text-teal-700',
}

export function CampaignsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [actioningId, setActioningId] = useState(null)

  const { data, isLoading } = useAdminCampaigns()
  const allCampaigns = data?.campaigns ?? []
  const { mutateAsync: doAction } = useAdminCampaignAction()

  const campaigns = allCampaigns.filter((c) => {
    const matchSearch = !search ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      (c.beneficiary || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.region || '').toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || c.status === statusFilter
    return matchSearch && matchStatus
  })

  const statuses = ['all', CAMPAIGN_STATUS.ACTIVE, CAMPAIGN_STATUS.PENDING, CAMPAIGN_STATUS.COMPLETED, CAMPAIGN_STATUS.REJECTED, CAMPAIGN_STATUS.SUSPENDED]

  async function handleAction(campaign, action) {
    setActioningId(campaign.id)
    try {
      await doAction({ id: campaign.id, action })
    } finally {
      setActioningId(null)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Campaigns"
        description={`${allCampaigns.length} total campaigns on the platform`}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Active', count: allCampaigns.filter((c) => c.status === CAMPAIGN_STATUS.ACTIVE).length, color: 'text-green-600' },
          { label: 'Pending Review', count: allCampaigns.filter((c) => c.status === CAMPAIGN_STATUS.PENDING).length, color: 'text-amber-600' },
          { label: 'Completed', count: allCampaigns.filter((c) => c.status === CAMPAIGN_STATUS.COMPLETED).length, color: 'text-blue-600' },
          { label: 'Suspended', count: allCampaigns.filter((c) => c.status === CAMPAIGN_STATUS.SUSPENDED).length, color: 'text-red-600' },
        ].map(({ label, count, color }) => (
          <div key={label} className="border rounded-xl p-4 bg-card">
            <p className={cn('text-2xl font-extrabold', color)}>{count}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search campaigns..."
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
            <table className="w-full text-sm min-w-[700px]">
              <thead className="border-b bg-muted/50">
                <tr>
                  {['Campaign', 'Category', 'Region', 'Progress', 'Status', 'Deadline', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {campaigns.map((c) => {
                  const pct = progressPercent(c.raised, c.goal)
                  const isActioning = actioningId === c.id
                  const categoryName = c.category_name ?? c.category ?? '—'
                  return (
                    <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 max-w-[200px]">
                        <p className="font-medium line-clamp-1">{c.title}</p>
                        <p className="text-xs text-muted-foreground">{c.beneficiary}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{categoryName}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{c.region}</td>
                      <td className="px-4 py-3 w-36">
                        <ProgressBar value={c.raised} max={c.goal} />
                        <p className="text-xs text-muted-foreground mt-1">{pct}% · {formatGMD(c.raised)}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn('text-xs font-semibold px-2 py-1 rounded-full capitalize', STATUS_COLORS[c.status] || 'bg-gray-100 text-gray-600')}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(c.deadline)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Link
                            to="/campaigns/$slug"
                            params={{ slug: c.slug }}
                            className="p-1.5 rounded hover:bg-accent transition-colors"
                            title="View"
                          >
                            <Eye className="w-4 h-4 text-muted-foreground" />
                          </Link>
                          {c.status === CAMPAIGN_STATUS.PENDING && (
                            <>
                              <button
                                onClick={() => handleAction(c, 'approve')}
                                disabled={isActioning}
                                className="p-1.5 rounded hover:bg-green-50 transition-colors disabled:opacity-50"
                                title="Approve"
                              >
                                {isActioning ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4 text-green-600" />}
                              </button>
                              <button
                                onClick={() => handleAction(c, 'reject')}
                                disabled={isActioning}
                                className="p-1.5 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
                                title="Reject"
                              >
                                <XCircle className="w-4 h-4 text-red-500" />
                              </button>
                            </>
                          )}
                          {c.status === CAMPAIGN_STATUS.ACTIVE && (
                            <button
                              onClick={() => handleAction(c, 'suspend')}
                              disabled={isActioning}
                              className="p-1.5 rounded hover:bg-orange-50 transition-colors disabled:opacity-50 text-xs font-medium text-orange-600"
                              title="Suspend"
                            >
                              Suspend
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
        {!isLoading && campaigns.length === 0 && (
          <div className="py-16 text-center">
            <SearchX className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No campaigns match your filters.</p>
          </div>
        )}
      </div>
    </div>
  )
}
