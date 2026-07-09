import { Sheet } from './Sheet'
import { formatDate } from '@/utils/formatters'
import { ROLES, GAMBIA_REGIONS } from '@/constants'

export function UserSheet({
  isOpen,
  onClose,
  user,
}) {
  if (!user) return null

  const roleName = Object.entries(ROLES).find(([_, val]) => val === user.role)?.[0] || user.role
  const regionLabel = GAMBIA_REGIONS.find((r) => r.value === user.region)?.label || user.region

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title={user?.full_name || user?.email}
      footer={
        <button
          onClick={onClose}
          className="w-full px-4 py-2 rounded-lg border hover:bg-accent transition-colors text-sm font-medium"
        >
          Close
        </button>
      }
    >
      <div className="space-y-4">
        <div className="p-3 rounded-lg bg-muted/50 border">
          <label className="text-xs font-semibold text-muted-foreground block mb-1">FULL NAME</label>
          <p className="text-sm font-medium">{user.full_name || '—'}</p>
        </div>

        <div className="p-3 rounded-lg bg-muted/50 border">
          <label className="text-xs font-semibold text-muted-foreground block mb-1">EMAIL</label>
          <p className="text-sm">{user.email || '—'}</p>
        </div>

        <div className="p-3 rounded-lg bg-muted/50 border">
          <label className="text-xs font-semibold text-muted-foreground block mb-1">PHONE</label>
          <p className="text-sm">{user.phone || '—'}</p>
        </div>

        <div className="p-3 rounded-lg bg-muted/50 border">
          <label className="text-xs font-semibold text-muted-foreground block mb-1">ROLE</label>
          <p className="text-sm capitalize">{roleName || '—'}</p>
        </div>

        <div className="p-3 rounded-lg bg-muted/50 border">
          <label className="text-xs font-semibold text-muted-foreground block mb-1">REGION</label>
          <p className="text-sm">{regionLabel || '—'}</p>
        </div>

        <div className="p-3 rounded-lg bg-muted/50 border">
          <label className="text-xs font-semibold text-muted-foreground block mb-1">STATUS</label>
          <p className="text-sm">{user.is_active ? 'Active' : 'Inactive'}</p>
        </div>

        <div className="p-3 rounded-lg bg-muted/50 border">
          <label className="text-xs font-semibold text-muted-foreground block mb-1">JOINED</label>
          <p className="text-sm">{formatDate(user.created_at)}</p>
        </div>
      </div>
    </Sheet>
  )
}
