import { useState } from 'react'
import { useNavigate, useParams } from '@tanstack/react-router'
import { ChevronLeft, ShieldCheck, ShieldOff } from 'lucide-react'
import { useUser } from '@/hooks/useUsers'
import { useMe } from '@/hooks/useAuth'
import { LoadingSpinner } from '@/components/custom/LoadingSpinner'
import { EmptyState } from '@/components/custom/EmptyState'
import { Resource, hasResourceAccess } from '@/utils/permissions'
import { cn } from '@/utils/cn'
import { TABS } from './FundraiserDetail/shared'
import { OverviewTab } from './FundraiserDetail/OverviewTab'
import { CampaignsTab } from './FundraiserDetail/CampaignsTab'
import { DonationsTab } from './FundraiserDetail/DonationsTab'
import { PayoutsTab } from './FundraiserDetail/PayoutsTab'

// Which resource gates each tab -- an admin who can view users but not,
// say, finances shouldn't see a Payouts tab that would just 403.
const TAB_RESOURCE = {
  overview: Resource.USERS_VIEW,
  campaigns: Resource.CAMPAIGNS_VIEW,
  donations: Resource.DONATIONS_VIEW,
  payouts: Resource.FINANCES_VIEW,
}

export function AdminFundraiserDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams({ strict: false })
  const { data: me } = useMe()
  const [activeTab, setActiveTab] = useState('overview')

  const { data: user, isLoading } = useUser(id)

  const visibleTabs = TABS.filter((tab) => hasResourceAccess(me?.resources, TAB_RESOURCE[tab.id]))

  if (isLoading) return <LoadingSpinner className="py-32" />

  if (!user) {
    return (
      <EmptyState
        title="Fundraiser not found"
        description="This user doesn't exist or has been removed."
        action={
          <button
            onClick={() => navigate({ to: '/admin/users' })}
            className="text-sm text-primary hover:underline"
          >
            Back to fundraisers
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
          onClick={() => navigate({ to: '/admin/users' })}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Fundraisers
        </button>

        <div className="flex flex-col sm:flex-row sm:items-start gap-4 justify-between">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary flex-shrink-0 overflow-hidden">
              {user.avatar ? (
                <img src={user.avatar} alt={user.full_name} className="w-full h-full object-cover" />
              ) : (
                (user.full_name || user.email || '?')[0].toUpperCase()
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold leading-snug truncate">{user.full_name || user.email}</h1>
              </div>
              <p className="text-sm text-muted-foreground mt-1 truncate">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
            <span className={cn(
              'text-xs font-semibold px-3 py-1.5 rounded-full border',
              user.is_active ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200',
            )}>
              {user.is_active ? 'Active' : 'Inactive'}
            </span>
            <span className={cn(
              'inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full border',
              user.is_verified ? 'bg-green-100 text-green-700 border-green-200' : 'bg-amber-100 text-amber-700 border-amber-200',
            )}>
              {user.is_verified ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldOff className="w-3.5 h-3.5" />}
              {user.is_verified ? 'Verified' : 'Not Verified'}
            </span>
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
        {activeTab === 'overview' && <OverviewTab user={user} />}
        {activeTab === 'campaigns' && <CampaignsTab user={user} />}
        {activeTab === 'donations' && <DonationsTab user={user} />}
        {activeTab === 'payouts' && <PayoutsTab user={user} />}
      </div>
    </div>
  )
}
