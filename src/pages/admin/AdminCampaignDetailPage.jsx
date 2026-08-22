import { useState } from 'react'
import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { ChevronLeft, Eye, Flame, Sparkles, EyeOff } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { campaignApi } from '@/api/campaignApi'
import { queryKeys } from '@/api/queryKeys'
import { LoadingSpinner } from '@/components/custom/LoadingSpinner'
import { EmptyState } from '@/components/custom/EmptyState'
import { useMe } from '@/hooks/useAuth'
import { Resource, hasResourceAccess } from '@/utils/permissions'
import { cn } from '@/utils/cn'
import { TABS, STATUS_BADGE } from './AdminCampaignDetail/shared'
import { StatusActions } from './AdminCampaignDetail/StatusActions'
import { OverviewTab } from './AdminCampaignDetail/OverviewTab'
import { DonationsTab } from './AdminCampaignDetail/DonationsTab'
import { WithdrawalsTab } from './AdminCampaignDetail/WithdrawalsTab'
import { ReportsTab } from './AdminCampaignDetail/ReportsTab'

// Which resource gates each tab -- a role that can view campaigns but not,
// say, finances shouldn't see a Withdrawals tab that would just 403.
const TAB_RESOURCE = {
  overview: Resource.CAMPAIGNS_VIEW,
  donations: Resource.DONATIONS,
  withdrawals: Resource.FINANCES,
  reports: Resource.REPORTS,
}

export function AdminCampaignDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams({ strict: false })
  const { data: me } = useMe()
  const [activeTab, setActiveTab] = useState('overview')

  const { data: campaign, isLoading, refetch } = useQuery({
    queryKey: queryKeys.campaigns.adminDetail(id),
    queryFn: () => campaignApi.getAdminCampaignDetail(id).then((res) => res?.data?.campaign ?? null),
    enabled: Boolean(id),
  })

  const visibleTabs = TABS.filter((tab) => hasResourceAccess(me?.role, TAB_RESOURCE[tab.id]))
  const canModerate = hasResourceAccess(me?.role, Resource.CAMPAIGNS_MODERATE)

  if (isLoading) return <LoadingSpinner className="py-32" />

  if (!campaign) {
    return (
      <EmptyState
        title="Campaign not found"
        description="This campaign doesn't exist or has been removed."
        action={
          <button
            onClick={() => navigate({ to: '/admin/campaigns' })}
            className="text-sm text-primary hover:underline"
          >
            Back to campaigns
          </button>
        }
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate({ to: '/admin/campaigns' })}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Campaigns
        </button>

        <div className="flex flex-col sm:flex-row sm:items-start gap-4 justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold leading-snug">{campaign.title}</h1>
              {campaign.is_urgent && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-red-50 text-red-700 border border-red-200">
                  <Flame className="w-3 h-3" /> Urgent
                </span>
              )}
              {campaign.is_featured && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  <Sparkles className="w-3 h-3" /> Featured
                </span>
              )}
              {campaign.is_anonymous && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                  <EyeOff className="w-3 h-3" /> Anonymous owner
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">{campaign.beneficiary}</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
            <span className={cn('text-xs font-semibold px-3 py-1.5 rounded-full border capitalize', STATUS_BADGE[campaign.status] || 'bg-gray-100 text-gray-600 border-gray-200')}>
              {campaign.status}
            </span>
            {canModerate && <StatusActions campaign={campaign} onRefetch={refetch} />}
            <Link
              to="/campaigns/$slug"
              params={{ slug: campaign.slug }}
              className="inline-flex items-center gap-1.5 text-xs border font-medium px-3 py-1.5 rounded-full hover:bg-accent transition-colors"
            >
              <Eye className="w-3.5 h-3.5" /> Public view
            </Link>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b overflow-x-auto scrollbar-hide -mx-1 px-1">
        {visibleTabs.map(({ id: tabId, label, icon: Icon }) => (
          <button
            key={tabId}
            onClick={() => setActiveTab(tabId)}
            className={cn(
              'flex items-center gap-2 px-3 sm:px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors',
              activeTab === tabId
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'overview' && <OverviewTab campaign={campaign} />}
        {activeTab === 'donations' && <DonationsTab campaign={campaign} />}
        {activeTab === 'withdrawals' && <WithdrawalsTab campaign={campaign} />}
        {activeTab === 'reports' && <ReportsTab campaign={campaign} />}
      </div>
    </div>
  )
}
