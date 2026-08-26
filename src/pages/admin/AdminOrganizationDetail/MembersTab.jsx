import { Crown, Loader2, UserCheck } from 'lucide-react'
import { useAdminOrganizationMembers } from '@/hooks/useOrganizations'
import { EmptyState } from '@/components/custom/EmptyState'
import { formatDate, initials } from '@/utils/formatters'

export function MembersTab({ organization }) {
  const { data: members = [], isLoading } = useAdminOrganizationMembers(organization.id)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (members.length === 0) {
    return <EmptyState title="No members" description="This organization has no members." />
  }

  return (
    <div className="border rounded-2xl bg-card overflow-hidden divide-y">
      {members.map((m) => (
        <div key={m.id} className="flex items-center gap-3 px-5 py-4">
          <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
            {initials(m.user_name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate flex items-center gap-1.5">
              {m.user_name}
              {m.role_name === 'Owner' && <Crown className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />}
              {m.is_contact_person && <UserCheck className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />}
            </p>
            <p className="text-xs text-muted-foreground truncate">{m.user_email}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <span className="text-xs bg-muted px-2.5 py-1 rounded-full font-medium">{m.role_name}</span>
            <p className="text-[10px] text-muted-foreground mt-1">Joined {formatDate(m.created_at)}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
