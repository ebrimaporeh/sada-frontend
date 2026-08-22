import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Loader2, Megaphone } from 'lucide-react'
import { useAdminCampaigns } from '@/hooks/useCampaigns'
import { AdminPagination } from '@/components/custom/AdminPagination'
import { EmptyState } from '@/components/custom/EmptyState'
import { ProgressBar } from '@/components/custom/ProgressBar'
import { formatGMD, formatDate, progressPercent } from '@/utils/formatters'
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

export function CampaignsTab({ user }) {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const limit = 10

  const { data, isLoading } = useAdminCampaigns({ owner: user.id, page, page_size: limit })
  const campaigns = data?.campaigns ?? []
  const totalPages = data?.totalPages ?? 1
  const totalCount = data?.count ?? 0

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (campaigns.length === 0) {
    return (
      <EmptyState
        icon={Megaphone}
        title="No campaigns yet"
        description={`${user.full_name || 'This user'} hasn't started a campaign.`}
      />
    )
  }

  return (
    <div className="space-y-5">
      <div className="border rounded-2xl bg-card overflow-hidden divide-y">
        {campaigns.map((c) => (
          <div
            key={c.id}
            onClick={() => navigate({ to: '/admin/campaigns/$id', params: { id: c.id } })}
            className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-muted/30 transition-colors cursor-pointer"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-sm truncate">{c.title}</p>
                <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize flex-shrink-0', STATUS_COLORS[c.status] || 'bg-gray-100 text-gray-600')}>
                  {c.status}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{c.category_name} · {formatDate(c.deadline)}</p>
              <div className="mt-2 max-w-xs">
                <ProgressBar value={progressPercent(c.raised, c.goal)} />
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="font-bold text-sm">{formatGMD(c.raised)}</p>
              <p className="text-xs text-muted-foreground">of {formatGMD(c.goal)}</p>
            </div>
          </div>
        ))}
      </div>

      {campaigns.length > 0 && (
        <AdminPagination page={page} totalPages={totalPages} onPageChange={setPage} totalCount={totalCount} limit={limit} />
      )}
    </div>
  )
}
