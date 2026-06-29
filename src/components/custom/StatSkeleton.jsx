export function StatSkeleton() {
  return (
    <div className="border rounded-xl p-5 bg-card space-y-3 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-4 bg-muted rounded w-24" />
        <div className="w-10 h-10 rounded-lg bg-muted" />
      </div>
      <div className="space-y-1">
        <div className="h-8 bg-muted rounded w-32" />
        <div className="h-3 bg-muted rounded w-48" />
      </div>
    </div>
  )
}
