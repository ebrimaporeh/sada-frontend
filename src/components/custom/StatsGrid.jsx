import { cn } from '@/utils/cn'

export function StatsGrid({ items, isLoading, className }) {
  return (
    <div className={cn('stat-grid grid-cols-2 sm:grid-cols-4', className)}>
      {items.map(({ label, value }) => (
        <div key={label}>
          {isLoading || value == null ? (
            <div className="h-9 w-24 rounded-lg bg-muted animate-pulse" />
          ) : (
            <p className="font-display text-3xl font-bold text-foreground">{value}</p>
          )}
          <p className="text-sm text-muted-foreground mt-1">{label}</p>
        </div>
      ))}
    </div>
  )
}
