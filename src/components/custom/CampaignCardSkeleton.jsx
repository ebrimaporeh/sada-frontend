import { cn } from '@/utils/cn'

export function CampaignCardSkeleton({ className }) {
  return (
    <div className={cn('bg-card rounded-xl border overflow-hidden', className)}>
      <div className="h-44 bg-muted animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
        <div className="h-3 bg-muted rounded animate-pulse w-full" />
        <div className="h-3 bg-muted rounded animate-pulse w-5/6" />
        <div className="h-2 bg-muted rounded-full animate-pulse" />
        <div className="flex justify-between">
          <div className="h-4 bg-muted rounded animate-pulse w-24" />
          <div className="h-4 bg-muted rounded animate-pulse w-16" />
        </div>
        <div className="flex justify-between pt-1 border-t">
          <div className="h-3 bg-muted rounded animate-pulse w-20" />
          <div className="h-3 bg-muted rounded animate-pulse w-20" />
        </div>
      </div>
    </div>
  )
}
