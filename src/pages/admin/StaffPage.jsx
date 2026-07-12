import { useState } from 'react'
import { UserPlus, ShieldCheck, Check, ChevronDown, ChevronUp } from 'lucide-react'
import { PageHeader } from '@/components/custom/PageHeader'
import { LoadingSpinner } from '@/components/custom/LoadingSpinner'
import { EmptyState } from '@/components/custom/EmptyState'
import { StaffSheet } from '@/components/custom/StaffSheet'
import { AddStaffSheet } from '@/components/custom/AddStaffSheet'
import { useStaff } from '@/hooks/useUsers'
import { formatDate } from '@/utils/formatters'
import { ROLES } from '@/constants'
import { Resource, RESOURCE_LABELS, ROLE_LABELS, hasResourceAccess } from '@/utils/permissions'
import { cn } from '@/utils/cn'

const ROLE_BADGE = {
  [ROLES.ADMIN]: 'bg-purple-100 text-purple-700',
  [ROLES.MODERATOR]: 'bg-blue-100 text-blue-700',
  [ROLES.FINANCE_OFFICER]: 'bg-amber-100 text-amber-700',
}

const MATRIX_ROLES = [ROLES.ADMIN, ROLES.MODERATOR, ROLES.FINANCE_OFFICER]
const MATRIX_RESOURCES = Object.values(Resource)

function PermissionsMatrix() {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="border rounded-xl bg-card overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold hover:bg-accent transition-colors"
      >
        <span className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" /> Permissions Matrix — who can access what
        </span>
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {expanded && (
        <div className="overflow-x-auto border-t">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-xs text-muted-foreground uppercase">Resource</th>
                {MATRIX_ROLES.map((role) => (
                  <th key={role} className="px-4 py-2 text-center font-medium text-xs text-muted-foreground uppercase">
                    {ROLE_LABELS[role]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {MATRIX_RESOURCES.map((resource) => (
                <tr key={resource}>
                  <td className="px-4 py-2 text-xs font-medium">{RESOURCE_LABELS[resource] || resource}</td>
                  {MATRIX_ROLES.map((role) => (
                    <td key={role} className="px-4 py-2 text-center">
                      {hasResourceAccess(role, resource) && <Check className="w-4 h-4 text-green-600 inline" />}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export function StaffPage() {
  const [selectedStaff, setSelectedStaff] = useState(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false)

  const { data, isLoading } = useStaff({ page_size: 100 })
  const staff = data?.results || []

  const handleSelect = (member) => {
    setSelectedStaff(member)
    setIsSheetOpen(true)
  }

  return (
    <div className="min-h-full flex flex-col space-y-6">
      <PageHeader
        title="Staff"
        description={`${staff.length} staff member${staff.length === 1 ? '' : 's'} with admin panel access`}
        action={
          <button
            onClick={() => setIsAddStaffOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            <UserPlus className="w-4 h-4" />
            Add Staff
          </button>
        }
      />

      <PermissionsMatrix />

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <LoadingSpinner />
        </div>
      ) : staff.length === 0 ? (
        <EmptyState icon={ShieldCheck} title="No staff members yet" description="Add a moderator or finance officer to get started." />
      ) : (
        <div className="border rounded-lg overflow-hidden bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted">
                <tr>
                  {['Name', 'Email', 'Role', 'Status', 'Joined'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {staff.map((member) => (
                  <tr
                    key={member.id}
                    onClick={() => handleSelect(member)}
                    className="hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3">{member.full_name || '—'}</td>
                    <td className="px-4 py-3">{member.email}</td>
                    <td className="px-4 py-3">
                      <span className={cn('inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full capitalize', ROLE_BADGE[member.role] || 'bg-gray-100 text-gray-600')}>
                        {ROLE_LABELS[member.role] || member.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full',
                          member.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700',
                        )}
                      >
                        {member.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(member.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <StaffSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        staff={selectedStaff}
      />

      <AddStaffSheet
        isOpen={isAddStaffOpen}
        onClose={() => setIsAddStaffOpen(false)}
      />
    </div>
  )
}
