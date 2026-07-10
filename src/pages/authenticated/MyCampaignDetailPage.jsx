import { useState } from 'react'
import { Link, useParams } from '@tanstack/react-router'
import { ChevronLeft, Eye } from 'lucide-react'
import { useMyCampaign } from '@/hooks/useCampaigns'
import { ProgressBar } from '@/components/custom/ProgressBar'
import { LoadingSpinner } from '@/components/custom/LoadingSpinner'
import { EmptyState } from '@/components/custom/EmptyState'
import { formatGMD, progressPercent } from '@/utils/formatters'
import { ROUTES } from '@/constants'
import { cn } from '@/utils/cn'
import { TABS, STATUS_BADGE } from './MyCampaignDetail/shared'
import { OverviewTab } from './MyCampaignDetail/OverviewTab'
import { DonorsTab } from './MyCampaignDetail/DonorsTab'
import { UpdatesTab } from './MyCampaignDetail/UpdatesTab'
import { EditTab } from './MyCampaignDetail/EditTab'
import { WithdrawTab } from './MyCampaignDetail/WithdrawTab'

export function MyCampaignDetailPage() {
  const { slug } = useParams({ strict: false })
  const { campaign, donors, payouts, totalPaidOut, availableBalance, isLoading } = useMyCampaign(slug)
  const [activeTab, setActiveTab] = useState('overview')

  if (isLoading) return <LoadingSpinner className="py-32" />
  if (!campaign) {
    return (
      <EmptyState
        title="Campaign not found"
        description="This campaign doesn't exist in your account or has been removed."
      />
    )
  }

  const pct = progressPercent(campaign.raised, campaign.goal)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          to={ROUTES.MY_CAMPAIGNS}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> My Campaigns
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className={cn('w-full sm:w-2 sm:h-auto h-2 rounded-full sm:rounded-xl flex-shrink-0 bg-linear-to-b', campaign.gradient || 'from-primary to-primary/60')} />

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start gap-3 justify-between">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold leading-snug">{campaign.title}</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {campaign.region} · {campaign.category?.name ?? campaign.category} · {campaign.donors_count} donors
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={cn('text-xs font-semibold px-3 py-1.5 rounded-full border capitalize', STATUS_BADGE[campaign.status] || 'bg-gray-100 text-gray-600 border-gray-200')}>
                  {campaign.status}
                </span>
                <Link
                  to="/campaigns/$slug"
                  params={{ slug: campaign.slug }}
                  className="inline-flex items-center gap-1.5 text-xs border font-medium px-3 py-1.5 rounded-full hover:bg-accent transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" /> Public view
                </Link>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-3">
              <div className="flex-1">
                <ProgressBar value={campaign.raised} max={campaign.goal} />
              </div>
              <span className="text-sm font-bold text-primary flex-shrink-0">{pct}%</span>
              <span className="text-xs text-muted-foreground flex-shrink-0">{formatGMD(campaign.raised)} raised</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b overflow-x-auto scrollbar-hide -mx-1 px-1">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              'flex items-center gap-2 px-3 sm:px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors',
              activeTab === id
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
        {activeTab === 'overview' && (
          <OverviewTab
            campaign={campaign}
            donors={donors}
            payouts={payouts}
            totalPaidOut={totalPaidOut}
            availableBalance={availableBalance}
          />
        )}
        {activeTab === 'donors' && <DonorsTab donors={donors} />}
        {activeTab === 'updates' && <UpdatesTab campaign={campaign} />}
        {activeTab === 'edit' && <EditTab campaign={campaign} />}
        {activeTab === 'withdraw' && (
          <WithdrawTab
            campaign={campaign}
            payouts={payouts}
            availableBalance={availableBalance}
            totalPaidOut={totalPaidOut}
          />
        )}
      </div>
    </div>
  )
}
