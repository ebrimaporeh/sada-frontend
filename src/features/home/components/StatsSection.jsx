import { usePublicStats } from '@/hooks/useCampaigns'
import { formatGMD, compactNumber } from '@/utils/formatters'

export function StatsSection() {
  const { stats, isLoading } = usePublicStats()

  const items = [
    { label: 'Total Raised', value: stats ? formatGMD(stats.total_raised) : null },
    { label: 'Active Campaigns', value: stats ? compactNumber(stats.active_campaigns) : null },
    { label: 'Generous Donors', value: stats ? compactNumber(stats.donors_count) : null },
    { label: 'Success Rate', value: stats ? `${stats.success_rate}%` : null },
  ]

  return (
    <section className="border-y py-16 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {items.map(({ label, value }) => (
            <div key={label} className="text-center">
              {isLoading || value === null ? (
                <div className="h-9 md:h-10 w-24 mx-auto rounded-lg bg-muted animate-pulse mb-2" />
              ) : (
                <p className="text-3xl md:text-4xl font-bold text-primary mb-2">{value}</p>
              )}
              <p className="text-sm md:text-base text-muted-foreground font-medium">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
