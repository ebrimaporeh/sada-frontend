import { useState } from 'react'
import { UserPlus, ShieldCheck, Save, Loader2, AlertCircle, Users, KeyRound, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/custom/PageHeader'
import { LoadingSpinner } from '@/components/custom/LoadingSpinner'
import { EmptyState } from '@/components/custom/EmptyState'
import { StaffSheet } from '@/components/custom/StaffSheet'
import { AddStaffSheet } from '@/components/custom/AddStaffSheet'
import { RoleFormSheet } from '@/components/custom/RoleFormSheet'
import { PermissionChecklist } from '@/components/custom/PermissionChecklist'
import { ConfirmModal } from '@/components/custom/ConfirmModal'
import { useStaff } from '@/hooks/useUsers'
import { useRolePermissions, useUpdateRolePermissions, useDeleteRole } from '@/hooks/usePermissions'
import { formatDate } from '@/utils/formatters'
import { roleLabel, roleBadgeClass } from '@/utils/permissions'
import { cn } from '@/utils/cn'

function RoleCard({ role, label, currentResources, resourceGroups }) {
  const updateRolePermissions = useUpdateRolePermissions()
  const deleteRole = useDeleteRole()
  const [draft, setDraft] = useState(null) // null until touched -- then a Set
  const [notice, setNotice] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const selected = draft ?? new Set(currentResources)
  const original = new Set(currentResources)
  const isDirty = draft !== null && (
    draft.size !== original.size || [...draft].some((r) => !original.has(r))
  )

  function toggle(key) {
    const next = new Set(selected)
    next.has(key) ? next.delete(key) : next.add(key)
    setDraft(next)
    setNotice(null)
  }

  function handleSave() {
    updateRolePermissions.mutate(
      { role, resources: Array.from(selected) },
      {
        onSuccess: () => {
          setDraft(null)
          setNotice({ type: 'success', message: 'Permissions updated.' })
          setTimeout(() => setNotice(null), 3000)
        },
        onError: (err) => {
          setNotice({ type: 'error', message: err?.response?.data?.message || 'Failed to update permissions.' })
        },
      },
    )
  }

  function handleDelete() {
    deleteRole.mutate(role, { onSuccess: () => setShowDeleteConfirm(false) })
  }

  return (
    <>
      <div className="border rounded-xl bg-card p-5 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" /> {label}
          </h3>
          <div className="flex items-center gap-3">
            {isDirty && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600">
                <AlertCircle className="w-3.5 h-3.5" /> Unsaved changes
              </span>
            )}
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="text-muted-foreground hover:text-destructive transition-colors"
              title={`Delete ${label}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <PermissionChecklist groups={resourceGroups} selected={selected} onToggle={toggle} />

        {notice && (
          <p className={cn('text-xs font-medium', notice.type === 'success' ? 'text-green-600' : 'text-destructive')}>
            {notice.message}
          </p>
        )}

        <button
          onClick={handleSave}
          disabled={!isDirty || updateRolePermissions.isPending}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium disabled:opacity-50"
        >
          {updateRolePermissions.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {updateRolePermissions.isPending ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title={`Delete ${label}?`}
        description={`This permanently removes the "${label}" role. Any staff member still assigned to it must be moved to a different role first.`}
        confirmLabel="Yes, delete role"
        isLoading={deleteRole.isPending}
        variant="destructive"
        errorMessage={deleteRole.isError ? deleteRole.error?.response?.data?.message || 'Failed to delete role.' : null}
      />
    </>
  )
}

function RolePermissionsEditor() {
  const { data, isLoading } = useRolePermissions()
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="border rounded-xl bg-card p-8 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  const resourceGroups = data?.resources ?? []
  const roles = data?.roles ?? []

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-semibold flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" /> Role Permissions
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Toggle exactly what each role can view, create, edit, or delete, grouped by area. Changes apply
            immediately to every staff member with that role — no deploy required. Admin always has full access.
          </p>
        </div>
        <button
          onClick={() => setIsCreateRoleOpen(true)}
          className="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg border hover:bg-accent transition-colors text-sm font-medium"
        >
          <KeyRound className="w-4 h-4" />
          Create Role
        </button>
      </div>

      {roles.length === 0 ? (
        <EmptyState icon={KeyRound} title="No roles yet" description="Create a role to start granting admin panel access." />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {roles.map(({ role, label, resources: currentResources }) => (
            <RoleCard key={role} role={role} label={label} currentResources={currentResources} resourceGroups={resourceGroups} />
          ))}
        </div>
      )}

      <RoleFormSheet
        isOpen={isCreateRoleOpen}
        onClose={() => setIsCreateRoleOpen(false)}
        resourceGroups={resourceGroups}
      />
    </div>
  )
}

const PAGE_TABS = [
  { key: 'staff', label: 'Staff', icon: Users },
  { key: 'permissions', label: 'Roles & Permissions', icon: ShieldCheck },
]

export function StaffPage() {
  const [activeTab, setActiveTab] = useState(PAGE_TABS[0].key)
  const [selectedStaff, setSelectedStaff] = useState(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false)

  const { data, isLoading } = useStaff({ page_size: 100 })
  const staff = data?.results || []

  // Shared with RolePermissionsEditor's own fetch via the same query key --
  // react-query dedupes the network request, this just needs the live role
  // catalog too so the table can show each member's real role name/color
  // instead of a static per-role map that would go stale the moment an
  // admin creates or renames a role.
  const { data: rolePermissions } = useRolePermissions()
  const dynamicRoles = rolePermissions?.roles ?? []

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

      <div className="flex gap-2 flex-wrap border-b">
        {PAGE_TABS.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activeTab === tab.key
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {activeTab === 'permissions' && <RolePermissionsEditor />}

      {activeTab === 'staff' && (
        isLoading ? (
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
                        <span className={cn('inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full', roleBadgeClass(member.role))}>
                          {roleLabel(member.role, dynamicRoles)}
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
        )
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
