import { cn } from '@/utils/cn'

export function ProgressBar({ value = 0, max = 100, className, showLabel = false }) {
  const pct = Math.min(Math.round((value / max) * 100), 100)
  const color = pct >= 90 ? 'bg-primary' : pct >= 60 ? 'bg-primary' : 'bg-primary/80'

  return (
    <div className={cn('space-y-1', className)}>
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', color)}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <p className="text-xs text-muted-foreground text-right">{pct}%</p>
      )}
    </div>
  )
}
