import { useState } from 'react'
import { useNavigate, useParams } from '@tanstack/react-router'
import { ChevronLeft, Building2, ShieldCheck, ShieldOff } from 'lucide-react'
import { useAdminOrganization } from '@/hooks/useOrganizations'
import { useMe } from '@/hooks/useAuth'
import { LoadingSpinner } from '@/components/custom/LoadingSpinner'
import { EmptyState } from '@/components/custom/EmptyState'
import { Resource, hasResourceAccess } from '@/utils/permissions'
import { cn } from '@/utils/cn'
import { TABS } from './AdminOrganizationDetail/shared'
import { OverviewTab } from './AdminOrganizationDetail/OverviewTab'
import { MembersTab } from './AdminOrganizationDetail/MembersTab'
import { CampaignsTab } from './AdminOrganizationDetail/CampaignsTab'
import { VerificationTab } from './AdminOrganizationDetail/VerificationTab'

// Same reasoning as AdminFundraiserDetailPage's TAB_RESOURCE.
const TAB_RESOURCE = {
  overview: Resource.USERS_VIEW,
  members: Resource.USERS_VIEW,
  campaigns: Resource.CAMPAIGNS_VIEW,
  verification: Resource.VERIFICATIONS_VIEW,
}

export function AdminOrganizationDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams({ strict: false })
  const { data: me } = useMe()
  const [activeTab, setActiveTab] = useState('overview')

  const { data: organization, isLoading } = useAdminOrganization(id)

  const visibleTabs = TABS.filter((tab) => hasResourceAccess(me?.resources, TAB_RESOURCE[tab.id]))

  if (isLoading) return <LoadingSpinner className="py-32" />

  if (!organization) {
    return (
      <EmptyState
        title="Organization not found"
        description="This organization doesn't exist or has been removed."
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
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {organization.logo ? (
                <img src={organization.logo} alt={organization.organization_name} className="w-full h-full object-cover" />
              ) : (
                <Building2 className="w-6 h-6 text-primary" />
              )}
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold leading-snug truncate">{organization.organization_name}</h1>
              <p className="text-sm text-muted-foreground mt-1 truncate">{organization.organization_type_name}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
            <span className={cn(
              'inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full border',
              organization.is_verified ? 'bg-green-100 text-green-700 border-green-200' : 'bg-amber-100 text-amber-700 border-amber-200',
            )}>
              {organization.is_verified ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldOff className="w-3.5 h-3.5" />}
              {organization.is_verified ? 'Verified' : 'Not Verified'}
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
        {activeTab === 'overview' && <OverviewTab organization={organization} />}
        {activeTab === 'members' && <MembersTab organization={organization} />}
        {activeTab === 'campaigns' && <CampaignsTab organization={organization} />}
        {activeTab === 'verification' && <VerificationTab organization={organization} />}
      </div>
    </div>
  )
}
