import { Banknote, Landmark, Loader2, Wallet } from 'lucide-react'
import { useAdminOwnerPayouts } from '@/hooks/usePayments'
import { EmptyState } from '@/components/custom/EmptyState'
import { formatGMD, formatDateTime } from '@/utils/formatters'
import { PAYMENT_METHODS } from '@/constants'
import { cn } from '@/utils/cn'
import { StatCard } from '../AdminCampaignDetail/shared'

const STATUS_COLORS = {
  completed: 'bg-green-100 text-green-700',
  processing: 'bg-blue-100 text-blue-700',
  pending: 'bg-amber-100 text-amber-700',
  failed: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-600',
}

export function PayoutsTab({ user }) {
  const { data: payouts, isLoading } = useAdminOwnerPayouts(user.id)
  const list = payouts ?? []

  const totalWithdrawn = list
    .filter((p) => p.status === 'completed')
    .reduce((sum, p) => sum + Number(p.amount ?? 0), 0)
  const inFlight = list
    .filter((p) => p.status === 'pending' || p.status === 'processing')
    .reduce((sum, p) => sum + Number(p.amount ?? 0), 0)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Payouts" value={list.length} icon={Banknote} color="bg-primary/10 text-primary" />
        <StatCard label="Withdrawn" value={formatGMD(totalWithdrawn)} icon={Landmark} color="bg-blue-100 text-blue-700" />
        <StatCard label="In Progress" value={formatGMD(inFlight)} icon={Wallet} color="bg-amber-100 text-amber-700" />
      </div>

      {list.length === 0 ? (
        <EmptyState
          icon={Banknote}
          title="No payouts yet"
          description="This campaigner hasn't requested a payout."
        />
      ) : (
        <div className="border rounded-2xl bg-card overflow-hidden">
          <div className="px-5 py-4 border-b">
            <h3 className="font-semibold">Payout History</h3>
          </div>
          <div className="divide-y">
            {list.map((p) => {
              const provMeta = PAYMENT_METHODS.find((m) => m.id === p.provider)
              return (
                <div key={p.id} className="flex items-center justify-between px-5 py-4 gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {provMeta && (
                      <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0', provMeta.color)}>
                        {provMeta.short}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{p.campaign_title}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatGMD(p.amount)} · {provMeta?.name || p.provider}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{formatDateTime(p.processed_at || p.created_at)}</p>
                    </div>
                  </div>
                  <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 capitalize', STATUS_COLORS[p.status] || 'bg-gray-100 text-gray-600')}>
                    {p.status}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
