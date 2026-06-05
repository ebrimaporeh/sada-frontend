import { formatGMD, compactNumber } from '@/utils/formatters'

const stats = [
  { label: 'Total Raised', value: 'D 12.5M', sub: 'GMD raised on platform' },
  { label: 'Active Campaigns', value: '247', sub: 'campaigns funded' },
  { label: 'Generous Donors', value: '8,945', sub: 'people gave back' },
  { label: 'Success Rate', value: '78%', sub: 'campaigns reach their goal' },
]

export function StatsSection() {
  return (
    <section className="border-y bg-primary/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map(({ label, value, sub }) => (
            <div key={label} className="space-y-1">
              <p className="text-3xl font-extrabold text-primary">{value}</p>
              <p className="text-sm font-semibold">{label}</p>
              <p className="text-xs text-muted-foreground hidden sm:block">{sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
