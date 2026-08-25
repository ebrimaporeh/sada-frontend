import { Link } from '@tanstack/react-router'
import { TrendingUp, Users, Eye, PlusCircle, ArrowRight, Flag, Megaphone, Heart, Building2 } from 'lucide-react'
import { useMe } from '@/hooks/useAuth'
import { useMyMissions } from '@/hooks/useCampaigns'
import { useMyDonations } from '@/hooks/useDonations'
import { PageHeader } from '@/components/custom/PageHeader'
import { ProgressBar } from '@/components/custom/ProgressBar'
import { formatGMD, progressPercent, timeAgo } from '@/utils/formatters'
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

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="border rounded-xl p-3 sm:p-5 space-y-2 sm:space-y-3 bg-card">
      <div className={cn('w-7 h-7 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center', color)}>
        <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </div>
      <p className="text-lg sm:text-2xl font-extrabold truncate">{value}</p>
      <div>
        <p className="text-xs sm:text-sm font-medium">{label}</p>
        {sub && <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

function CampaignRow({ campaign }) {
  const pct = progressPercent(campaign.raised, campaign.goal)
  return (
    <div className="border rounded-xl p-4 bg-card space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <Link
            to="/my-campaigns/$slug"
            params={{ slug: campaign.slug }}
            className="font-semibold text-sm hover:text-primary transition-colors line-clamp-1"
          >
            {campaign.title}
          </Link>
          <p className="text-xs text-muted-foreground mt-0.5">{campaign.region} · {campaign.category?.name ?? campaign.category}</p>
          {campaign.organization_id && (
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
              <Building2 className="w-3 h-3" /> {campaign.organization_name}
            </p>
          )}
        </div>
        <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full capitalize flex-shrink-0', STATUS_COLORS[campaign.status] || 'bg-gray-100 text-gray-600')}>
          {campaign.status}
        </span>
      </div>
      <ProgressBar value={campaign.raised} max={campaign.goal} />
      <div className="flex items-center justify-between">
        <span className="font-bold text-primary text-sm">{formatGMD(campaign.raised)}</span>
        <span className="text-xs text-muted-foreground">{pct}% of {formatGMD(campaign.goal)}</span>
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-2">
        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {campaign.donors_count} donors</span>
        <Link
          to="/my-campaigns/$slug"
          params={{ slug: campaign.slug }}
          className="text-primary hover:underline font-medium flex items-center gap-1"
        >
          Manage <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  )
}

function RecentDonationRow({ donation }) {
  const donor = donation.donor_name || donation.donor || 'Anonymous'
  return (
    <div className="flex items-start justify-between gap-3 py-3 border-b last:border-0">
      <div className="flex items-start gap-3 min-w-0 flex-1">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0 mt-0.5">
          {donor[0].toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{donor}</p>
          <p className="text-xs text-muted-foreground line-clamp-2 wrap-break-word">{donation.campaign_title || donation.campaign}</p>
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-bold text-primary whitespace-nowrap">{formatGMD(donation.amount)}</p>
        <p className="text-xs text-muted-foreground whitespace-nowrap">{timeAgo(donation.paid_at || donation.created_at || donation.date)}</p>
      </div>
    </div>
  )
}

export function Dashboard() {
  const { data: user } = useMe()
  const { data: campaigns = [], isLoading: campaignsLoading } = useMyMissions()
  const { data: donorData } = useMyDonations()
  const donations = donorData?.donations ?? []

  const totalRaised = campaigns.reduce((s, c) => s + Number(c.raised ?? 0), 0)
  const activeCampaigns = campaigns.filter((c) => c.status === CAMPAIGN_STATUS.ACTIVE).length
  const totalDonors = campaigns.reduce((s, c) => s + (c.donors_count ?? 0), 0)
  const totalViews = campaigns.reduce((s, c) => s + (c.views_count ?? 0), 0)

  const statCards = [
    { icon: TrendingUp, label: 'Total Raised', value: formatGMD(totalRaised), sub: 'across all campaigns', color: 'bg-primary/10 text-primary' },
    { icon: Flag, label: 'Active Campaigns', value: activeCampaigns, sub: 'currently running', color: 'bg-green-100 text-green-700' },
    { icon: Users, label: 'Total Donors', value: totalDonors.toLocaleString(), sub: 'generous supporters', color: 'bg-blue-100 text-blue-700' },
    { icon: Eye, label: 'Campaign Views', value: totalViews.toLocaleString(), sub: 'all time', color: 'bg-amber-100 text-amber-700' },
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <PageHeader
          title={`Welcome back, ${user?.first_name || 'there'}!`}
          description="Here's an overview of your fundraising activity."
        />
        <Link
          to={ROUTES.CAMPAIGN_NEW}
          className="hidden sm:inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm"
        >
          <PlusCircle className="w-4 h-4" /> New Campaign
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg">My Campaigns</h2>
            <Link to={ROUTES.CAMPAIGNS} className="text-sm text-primary hover:underline font-medium flex items-center gap-1">
              Browse all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {campaigns.length === 0 ? (
            <div className="border rounded-xl p-10 text-center space-y-3 bg-card">
              <Megaphone className="w-8 h-8 mx-auto text-muted-foreground" />
              <p className="font-semibold">No campaigns yet</p>
              <p className="text-sm text-muted-foreground">Start your first fundraiser today.</p>
              <Link
                to={ROUTES.CAMPAIGN_NEW}
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-medium px-4 py-2 rounded-lg text-sm hover:bg-primary/90 transition-colors mt-2"
              >
                <PlusCircle className="w-4 h-4" /> Start a Campaign
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {campaigns.map((c) => (
                <CampaignRow key={c.id} campaign={c} />
              ))}
              <Link
                to={ROUTES.CAMPAIGN_NEW}
                className="flex items-center justify-center gap-2 border-2 border-dashed rounded-xl p-4 text-sm font-medium text-muted-foreground hover:text-primary hover:border-primary transition-colors"
              >
                <PlusCircle className="w-4 h-4" /> Start another campaign
              </Link>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-bold text-lg">Recent Donations</h2>
          <div className="border rounded-xl bg-card p-4 overflow-hidden">
            {donations.length === 0 ? (
              <div className="py-8 text-center">
                <Heart className="w-8 h-8 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No donations yet</p>
              </div>
            ) : (
              <>
                {donations.slice(0, 6).map((d) => (
                  <RecentDonationRow key={d.id} donation={d} />
                ))}
                {donations.length > 6 && (
                  <p className="text-xs text-center text-muted-foreground pt-3">
                    +{donations.length - 6} more donations
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
