import { useState } from 'react'
import { KeyRound, Crown, Lock, Pencil, Trash2, Plus } from 'lucide-react'
import { useOrganizationRoles, useDeleteOrganizationRole, useMyOrganizationMembership } from '@/hooks/useOrganizations'
import { OrgRoleFormSheet } from '@/features/organizations/components/OrgRoleFormSheet'
import { ConfirmModal } from '@/components/custom/ConfirmModal'
import { ORGANIZATION_PERMISSIONS, OrganizationPermission } from '@/constants'

const PROTECTED_ROLE_NAMES = ['Owner', 'Member']

function permissionLabel(value) {
  return ORGANIZATION_PERMISSIONS.find((p) => p.value === value)?.label || value
}

function RoleCard({ role, organizationId, canManage }) {
  const isProtected = PROTECTED_ROLE_NAMES.includes(role.name)
  const deleteRole = useDeleteOrganizationRole(organizationId)
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <>
      <div className="border rounded-2xl bg-card p-5 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold text-sm flex items-center gap-1.5">
            {role.name === 'Owner' && <Crown className="w-4 h-4 text-amber-500" />}
            {role.name}
            {isProtected && <Lock className="w-3.5 h-3.5 text-muted-foreground" />}
          </h3>
          {canManage && !isProtected && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="p-1.5 rounded-lg hover:bg-accent transition-colors"
                title="Edit role"
              >
                <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="p-1.5 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors"
                title="Delete role"
              >
                <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>
          )}
        </div>
        {role.permissions.length === 0 ? (
          <p className="text-xs text-muted-foreground">No permissions granted.</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {role.permissions.map((p) => (
              <span key={p} className="text-[11px] bg-muted px-2 py-1 rounded-full font-medium">
                {permissionLabel(p)}
              </span>
            ))}
          </div>
        )}
      </div>

      {editing && (
        <OrgRoleFormSheet isOpen={editing} onClose={() => setEditing(false)} organizationId={organizationId} role={role} />
      )}
      <ConfirmModal
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => deleteRole.mutate(role.id, { onSuccess: () => setConfirmDelete(false) })}
        title={`Delete "${role.name}"?`}
        description="This only works if no member currently holds this role and no invitation is using it."
        confirmLabel="Delete"
        isLoading={deleteRole.isPending}
        errorMessage={deleteRole.isError ? deleteRole.error?.response?.data?.message || 'Failed to delete role.' : null}
      />
    </>
  )
}

export function OrganizationRoles({ organization }) {
  const { data: roles = [], isLoading } = useOrganizationRoles(organization.id)
  const myMembership = useMyOrganizationMembership(organization.id)
  const canManage = myMembership?.permissions?.includes(OrganizationPermission.MANAGE_MEMBERS)
  const [showCreate, setShowCreate] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="font-semibold text-base flex items-center gap-2">
            <KeyRound className="w-4 h-4" /> Roles ({roles.length})
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Owner and Member are built in and can't be edited or deleted. Create custom roles for anything in between.
          </p>
        </div>
        {canManage && (
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-1.5 text-xs bg-primary text-primary-foreground font-medium px-3 py-1.5 rounded-full hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> New Role
          </button>
        )}
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground text-center py-6">Loading roles…</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {roles.map((role) => (
            <RoleCard key={role.id} role={role} organizationId={organization.id} canManage={canManage} />
          ))}
        </div>
      )}

      <OrgRoleFormSheet isOpen={showCreate} onClose={() => setShowCreate(false)} organizationId={organization.id} role={null} />
    </div>
  )
}
