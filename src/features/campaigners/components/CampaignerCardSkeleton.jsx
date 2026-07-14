import { cn } from '@/utils/cn'

export function CampaignerCardSkeleton({ className }) {
  return (
    <div className={cn('bg-card rounded-xl border p-5 text-center', className)}>
      <div className="w-16 h-16 rounded-full bg-muted animate-pulse mx-auto" />
      <div className="h-4 bg-muted rounded animate-pulse w-2/3 mx-auto mt-3" />
      <div className="h-3 bg-muted rounded animate-pulse w-1/3 mx-auto mt-2" />
      <div className="h-3 bg-muted rounded animate-pulse w-full mt-3" />
      <div className="flex justify-center gap-4 mt-4 pt-3 border-t">
        <div className="h-3 bg-muted rounded animate-pulse w-20" />
        <div className="h-3 bg-muted rounded animate-pulse w-20" />
      </div>
    </div>
  )
}
