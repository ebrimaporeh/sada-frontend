import { useEffect, useState } from 'react'
import { Loader2, AlertCircle } from 'lucide-react'
import { Sheet } from '@/components/custom/Sheet'
import { Toggle } from '@/components/custom/Toggle'
import { useCreateOrganizationRole, useUpdateOrganizationRole } from '@/hooks/useOrganizations'
import { ORGANIZATION_PERMISSIONS } from '@/constants'

const EMPTY_SELECTION = new Set()

// `role` is null for "create," or an existing role object for "edit" --
// Owner/Member are never passed in here (see OrganizationRoles, both are excluded
// from the editable list entirely, matching the backend's protection).
export function OrgRoleFormSheet({ isOpen, onClose, organizationId, role }) {
  const isEdit = Boolean(role)
  const [name, setName] = useState('')
  const [selected, setSelected] = useState(EMPTY_SELECTION)
  const createRole = useCreateOrganizationRole(organizationId)
  const updateRole = useUpdateOrganizationRole(organizationId)
  const mutation = isEdit ? updateRole : createRole

  useEffect(() => {
    if (isOpen) {
      setName(role?.name || '')
      setSelected(new Set(role?.permissions || []))
    }
  }, [isOpen, role])

  function handleClose() {
    mutation.reset()
    onClose()
  }

  function toggle(key) {
    const next = new Set(selected)
    next.has(key) ? next.delete(key) : next.add(key)
    setSelected(next)
  }

  function handleSubmit(e) {
    e.preventDefault()
    const payload = { name: name.trim(), permissions: Array.from(selected) }
    if (isEdit) {
      updateRole.mutate({ roleId: role.id, ...payload }, { onSuccess: handleClose })
    } else {
      createRole.mutate(payload, { onSuccess: handleClose })
    }
  }

  return (
    <Sheet
      isOpen={isOpen}
      onClose={handleClose}
      title={isEdit ? `Edit "${role?.name}"` : 'Create Role'}
      footer={
        <div className="flex items-center gap-2 w-full">
          <button type="button" onClick={handleClose} className="flex-1 px-4 py-2 rounded-lg border hover:bg-accent transition-colors text-sm font-medium">
            Close
          </button>
          <button
            type="submit"
            form="org-role-form"
            disabled={mutation.isPending || !name.trim()}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium disabled:opacity-50"
          >
            {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {mutation.isPending ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Role'}
          </button>
        </div>
      }
    >
      <form id="org-role-form" onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Role name *</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Treasurer"
            className="w-full px-3 py-2.5 border rounded-lg text-sm bg-background focus:outline-hidden focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Permissions</label>
          <p className="text-xs text-muted-foreground">
            Pick what members with this role can do for this organization.
          </p>
          <div className="border rounded-lg p-4 bg-muted/30 flex flex-wrap gap-x-4 gap-y-2">
            {ORGANIZATION_PERMISSIONS.map((perm) => (
              <Toggle
                key={perm.value}
                compact
                checked={selected.has(perm.value)}
                onChange={() => toggle(perm.value)}
                label={perm.label}
              />
            ))}
          </div>
        </div>

        {mutation.isError && (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-red-50 text-red-700 text-sm font-medium">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {mutation.error?.response?.data?.message || 'Failed to save role.'}
          </div>
        )}
      </form>
    </Sheet>
  )
}
