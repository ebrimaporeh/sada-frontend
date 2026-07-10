import { Link } from '@tanstack/react-router'
import { PlusCircle, Eye, ArrowRight, Loader2, Megaphone } from 'lucide-react'
import { PageHeader } from '@/components/custom/PageHeader'
import { ProgressBar } from '@/components/custom/ProgressBar'
import { formatGMD, formatDate, progressPercent, daysLeft } from '@/utils/formatters'
import { useMyMissions } from '@/hooks/useCampaigns'
import { ROUTES, CAMPAIGN_STATUS } from '@/constants'
import { cn } from '@/utils/cn'

const STATUS_COLORS = {
  [CAMPAIGN_STATUS.ACTIVE]: 'bg-green-100 text-green-700',
  [CAMPAIGN_STATUS.PENDING]: 'bg-amber-100 text-amber-700',
  [CAMPAIGN_STATUS.DRAFT]: 'bg-gray-100 text-gray-600',
  [CAMPAIGN_STATUS.COMPLETED]: 'bg-blue-100 text-blue-700',
  [CAMPAIGN_STATUS.REJECTED]: 'bg-red-100 text-red-700',
  [CAMPAIGN_STATUS.SUSPENDED]: 'bg-orange-100 text-orange-700',
}

function CampaignCard({ campaign }) {
  const pct = progressPercent(campaign.raised, campaign.goal)
  const days = daysLeft(campaign.deadline)

  return (
    <div className="border rounded-xl bg-card overflow-hidden hover:shadow-md transition-shadow">
      {/* Color bar header */}
      <div className={cn('h-2 bg-linear-to-r', campaign.gradient || 'from-primary to-primary/60')} />

      <div className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold leading-snug line-clamp-2">{campaign.title}</h3>
            <p className="text-xs text-muted-foreground mt-1">{campaign.region} · {campaign.category?.name ?? campaign.category}</p>
          </div>
          <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full capitalize flex-shrink-0 mt-0.5', STATUS_COLORS[campaign.status] || 'bg-gray-100 text-gray-600')}>
            {campaign.status}
          </span>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="font-bold text-primary">{formatGMD(campaign.raised)}</span>
            <span className="text-muted-foreground text-xs">of {formatGMD(campaign.goal)}</span>
          </div>
          <ProgressBar value={campaign.raised} max={campaign.goal} />
          <p className="text-xs text-muted-foreground">{pct}% funded · {campaign.donors_count} donors</p>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-3">
          <span>{days > 0 ? `${days} days left` : 'Ended'} · ends {formatDate(campaign.deadline)}</span>
          <Link
            to="/my-campaigns/$slug"
            params={{ slug: campaign.slug }}
            className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          >
            <Eye className="w-3.5 h-3.5" /> Manage
          </Link>
        </div>
      </div>
    </div>
  )
}

export function MyCampaignsPage() {
  const { data: campaigns = [], isLoading } = useMyMissions()
  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>

  const active = campaigns.filter((c) => c.status === CAMPAIGN_STATUS.ACTIVE)
  const other = campaigns.filter((c) => c.status !== CAMPAIGN_STATUS.ACTIVE)

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="My Campaigns"
          description={`You have ${campaigns.length} campaign${campaigns.length !== 1 ? 's' : ''}`}
        />
        <Link
          to={ROUTES.CAMPAIGN_NEW}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-4 py-2.5 rounded-xl hover:bg-primary/90 transition-colors text-sm self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" /> New Campaign
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <div className="border-2 border-dashed rounded-2xl p-16 text-center space-y-4">
          <Megaphone className="w-10 h-10 mx-auto text-muted-foreground" />
          <div>
            <p className="font-semibold text-lg">No campaigns yet</p>
            <p className="text-sm text-muted-foreground mt-1">Start fundraising for something that matters to you.</p>
          </div>
          <Link
            to={ROUTES.CAMPAIGN_NEW}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-colors text-sm"
          >
            <PlusCircle className="w-4 h-4" /> Start your first campaign
          </Link>
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <section className="space-y-4">
              <h2 className="font-bold text-base text-muted-foreground uppercase tracking-wide text-xs">Active ({active.length})</h2>
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {active.map((c) => <CampaignCard key={c.id} campaign={c} />)}
              </div>
            </section>
          )}

          {other.length > 0 && (
            <section className="space-y-4">
              <h2 className="font-bold text-xs text-muted-foreground uppercase tracking-wide">Other ({other.length})</h2>
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {other.map((c) => <CampaignCard key={c.id} campaign={c} />)}
              </div>
            </section>
          )}

          <div className="pt-2">
            <Link
              to={ROUTES.CAMPAIGNS}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Browse all public campaigns <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
