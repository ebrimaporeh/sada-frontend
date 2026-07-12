import { usePublicStats } from '@/hooks/useCampaigns'
import { StatsGrid } from '@/components/custom/StatsGrid'
import { formatGMD, compactNumber } from '@/utils/formatters'

export function StatsSection() {
  const { stats, isLoading } = usePublicStats()

  const items = [
    { label: 'Raised this week', value: stats ? formatGMD(stats.total_raised_this_week) : null },
    { label: 'Fundraisers', value: stats ? compactNumber(stats.fundraisers_count) : null },
    { label: 'Donors', value: stats ? compactNumber(stats.donors_count) : null },
    { label: 'Reach their goal', value: stats ? `${stats.success_rate}%` : null },
  ]

  return (
    <section className="border-y py-16 bg-muted/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <StatsGrid items={items} isLoading={isLoading} />
      </div>
    </section>
  )
}
