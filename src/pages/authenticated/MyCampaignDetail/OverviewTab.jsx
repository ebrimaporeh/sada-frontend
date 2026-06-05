import { Link } from '@tanstack/react-router'
import { TrendingUp, Users, Clock, ExternalLink } from 'lucide-react'
import { StatCard, SectionCard } from './shared'
import { ProgressBar } from '@/components/custom/ProgressBar'
import { formatGMD, formatDate, progressPercent, daysLeft } from '@/utils/formatters'
import { cn } from '@/utils/cn'

export function OverviewTab({ campaign, donors, payouts, totalPaidOut, availableBalance }) {
  const pct = progressPercent(campaign.raised, campaign.goal)
  const days = daysLeft(campaign.deadline)

  const topDonors = [...donors].sort((a, b) => b.amount - a.amount).slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total Raised" value={formatGMD(campaign.raised)} sub="GMD" icon={TrendingUp} color="bg-primary/10 text-primary" />
        <StatCard label="Donors" value={campaign.donors_count.toLocaleString()} sub="generous supporters" icon={Users} color="bg-blue-100 text-blue-700" />
        <StatCard label="Days Left" value={days > 0 ? days : 'Ended'} sub={days > 0 ? `until ${formatDate(campaign.deadline)}` : 'campaign ended'} icon={Clock} color="bg-amber-100 text-amber-700" />
        <StatCard label="Funded" value={`${pct}%`} sub={`of ${formatGMD(campaign.goal)} goal`} icon={TrendingUp} color="bg-green-100 text-green-700" />
      </div>

      <SectionCard title="Fundraising Progress">
        <div className="space-y-3">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-extrabold text-primary">{formatGMD(campaign.raised)}</p>
              <p className="text-sm text-muted-foreground mt-0.5">raised of {formatGMD(campaign.goal)} goal</p>
            </div>
            <p className="text-2xl font-bold text-muted-foreground">{pct}%</p>
          </div>
          <ProgressBar value={campaign.raised} max={campaign.goal} />
          <div className="grid grid-cols-3 gap-4 pt-1 text-center text-sm border-t mt-2 pt-4">
            <div>
              <p className="font-bold text-primary">{formatGMD(availableBalance)}</p>
              <p className="text-xs text-muted-foreground">Available to withdraw</p>
            </div>
            <div>
              <p className="font-bold">{formatGMD(totalPaidOut)}</p>
              <p className="text-xs text-muted-foreground">Already withdrawn</p>
            </div>
            <div>
              <p className="font-bold">{formatGMD(campaign.goal - campaign.raised)}</p>
              <p className="text-xs text-muted-foreground">Still needed</p>
            </div>
          </div>
        </div>
      </SectionCard>

      <div className="grid lg:grid-cols-2 gap-6">
        <SectionCard title="Top Donors">
          {topDonors.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No donations yet.</p>
          ) : (
            <div className="space-y-3">
              {topDonors.map((d, i) => {
                const isAnon = d.is_anonymous ?? d.anonymous
                const name = isAnon ? 'Anonymous' : (d.donor_name || d.donor || 'Unknown')
                return (
                  <div key={d.id} className="flex items-center gap-3">
                    <span className="w-6 text-xs font-bold text-muted-foreground text-center flex-shrink-0">#{i + 1}</span>
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                      {isAnon ? '?' : name[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{name}</p>
                      {d.message && <p className="text-xs text-muted-foreground truncate italic">"{d.message}"</p>}
                    </div>
                    <p className="text-sm font-bold text-primary flex-shrink-0">{formatGMD(d.amount)}</p>
                  </div>
                )
              })}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Payout History">
          {payouts.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">No withdrawals yet.</p>
              <p className="text-xs text-muted-foreground mt-1">You can withdraw funds from the Withdraw tab.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {payouts.map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-3 py-2 border-b last:border-0">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{formatGMD(p.amount)}</p>
                    <p className="text-xs text-muted-foreground">{p.provider} · {p.phone}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(p.completed_at || p.requested_at)}</p>
                  </div>
                  <span className={cn(
                    'text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0',
                    p.status === 'completed' ? 'bg-green-100 text-green-700' :
                    p.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                    p.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700',
                  )}>
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      <SectionCard title="Campaign Info">
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          {[
            ['Category', campaign.category?.name ?? campaign.category],
            ['Region', campaign.region],
            ['Beneficiary', campaign.beneficiary],
            ['Relationship', campaign.beneficiary_relationship],
            ['Created', formatDate(campaign.created_at)],
            ['Deadline', formatDate(campaign.deadline)],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
              <p className="font-medium">{value || '—'}</p>
            </div>
          ))}
        </div>
        <div className="pt-4 border-t mt-4">
          <Link
            to="/campaigns/$slug"
            params={{ slug: campaign.slug }}
            target="_blank"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline font-medium"
          >
            <ExternalLink className="w-3.5 h-3.5" /> View public campaign page
          </Link>
        </div>
      </SectionCard>
    </div>
  )
}
