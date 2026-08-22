import { Megaphone, MapPin, Calendar, Building2 } from 'lucide-react'
import { VerifiedTick } from '@/components/custom/VerifiedTick'
import { CampaignCard } from '@/components/custom/CampaignCard'
import { CampaignCardSkeleton } from '@/components/custom/CampaignCardSkeleton'
import { Breadcrumbs } from '@/components/custom/Breadcrumbs'
import { useCampaigns } from '@/hooks/useCampaigns'
import { formatGMD, formatDate, initials } from '@/utils/formatters'
import { usePageMeta } from '@/hooks/usePageMeta'
import { GAMBIA_REGIONS, ORGANIZATION_TYPES, ACCOUNT_TYPES, ROUTES } from '@/constants'
import { cn } from '@/utils/cn'

export function CampaignerProfileView({ campaigner }) {
  const { campaigns, isLoading } = useCampaigns({ owner: campaigner.id })
  const regionLabel = GAMBIA_REGIONS.find((r) => r.value === campaigner.region)?.label
  const isOrg = campaigner.account_type === ACCOUNT_TYPES.ORGANIZATION
  const orgTypeLabel = ORGANIZATION_TYPES.find((t) => t.value === campaigner.organization_type)?.label

  usePageMeta({
    title: campaigner.full_name,
    description: campaigner.bio || `${campaigner.campaign_count} campaign(s) on the platform.`,
    image: campaigner.avatar,
    type: 'profile',
  })

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <Breadcrumbs items={[{ label: 'Campaigners', to: ROUTES.CAMPAIGNERS }]} current={campaigner.full_name} />

      {/* Profile header */}
      <div className="border rounded-2xl p-6 bg-card flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
        <div className={cn(
          'w-24 h-24 bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold overflow-hidden flex-shrink-0',
          isOrg ? 'rounded-2xl' : 'rounded-full',
        )}>
          {campaigner.avatar
            ? <img src={campaigner.avatar} alt={campaigner.full_name} className="w-full h-full object-cover" />
            : initials(campaigner.full_name)
          }
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-center sm:justify-start gap-1.5">
            <h1 className="text-xl font-bold">{campaigner.full_name}</h1>
            {campaigner.is_verified && <VerifiedTick size="w-5 h-5" />}
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-4 text-sm text-muted-foreground mt-1.5 flex-wrap">
            {isOrg && orgTypeLabel && (
              <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" /> {orgTypeLabel}</span>
            )}
            {regionLabel && (
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {regionLabel}</span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Joined {formatDate(campaigner.created_at)}
            </span>
          </div>

          {campaigner.bio && (
            <p className="text-sm text-muted-foreground mt-3 max-w-xl">{campaigner.bio}</p>
          )}

          <div className="flex items-center justify-center sm:justify-start gap-6 mt-4 pt-4 border-t">
            <div>
              <p className="text-lg font-bold">{campaigner.campaign_count}</p>
              <p className="text-xs text-muted-foreground">Campaign{campaigner.campaign_count !== 1 ? 's' : ''}</p>
            </div>
            {campaigner.total_raised != null && (
              <div>
                <p className="text-lg font-bold">{formatGMD(campaigner.total_raised)}</p>
                <p className="text-xs text-muted-foreground">Total raised</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Their campaigns */}
      <div>
        <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
          <Megaphone className="w-4 h-4" /> Campaigns
        </h2>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <CampaignCardSkeleton key={i} />
            ))}
          </div>
        ) : campaigns.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center border rounded-xl">
            No public campaigns yet.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {campaigns.map((c) => (
              <CampaignCard key={c.id} campaign={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
