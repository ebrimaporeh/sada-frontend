import { TrendingUp, Users, Bell, Pencil, Banknote } from 'lucide-react'
import { CAMPAIGN_STATUS, PAYOUT_METHODS } from '@/constants'
import { cn } from '@/utils/cn'

export const TABS = [
  { id: 'overview', label: 'Overview', icon: TrendingUp },
  { id: 'donors', label: 'Donors', icon: Users },
  { id: 'updates', label: 'Updates', icon: Bell },
  { id: 'edit', label: 'Edit', icon: Pencil },
  { id: 'withdraw', label: 'Withdraw', icon: Banknote },
]

export { PAYOUT_METHODS as PAYOUT_PROVIDERS }

export const STATUS_BADGE = {
  [CAMPAIGN_STATUS.ACTIVE]: 'bg-green-100 text-green-700 border-green-200',
  [CAMPAIGN_STATUS.COMPLETED]: 'bg-blue-100 text-blue-700 border-blue-200',
  [CAMPAIGN_STATUS.PENDING]: 'bg-amber-100 text-amber-700 border-amber-200',
  [CAMPAIGN_STATUS.SUSPENDED]: 'bg-orange-100 text-orange-700 border-orange-200',
  [CAMPAIGN_STATUS.REJECTED]: 'bg-red-100 text-red-700 border-red-200',
}

export function StatCard({ label, value, sub, icon: Icon, color }) {
  return (
    <div className="border rounded-xl p-4 bg-card flex items-center gap-4">
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', color)}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xl font-extrabold leading-none">{value}</p>
        <p className="text-sm font-medium mt-0.5">{label}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

export function SectionCard({ title, action, children }) {
  return (
    <div className="border rounded-2xl bg-card overflow-hidden">
      {(title || action) && (
        <div className="flex items-center justify-between px-5 py-4 border-b">
          {title && <h3 className="font-semibold">{title}</h3>}
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  )
}
