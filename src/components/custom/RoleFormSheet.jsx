import { useState } from 'react'
import { Loader2, AlertCircle } from 'lucide-react'
import { Sheet } from './Sheet'
import { PermissionChecklist } from './PermissionChecklist'
import { useCreateRole } from '@/hooks/usePermissions'

const EMPTY_SELECTION = new Set()

export function RoleFormSheet({ isOpen, onClose, resourceGroups }) {
  const [name, setName] = useState('')
  const [selected, setSelected] = useState(EMPTY_SELECTION)
  const createRole = useCreateRole()

  function handleClose() {
    setName('')
    setSelected(EMPTY_SELECTION)
    createRole.reset()
    onClose()
  }

  function toggle(key) {
    const next = new Set(selected)
    next.has(key) ? next.delete(key) : next.add(key)
    setSelected(next)
  }

  function handleSubmit(e) {
    e.preventDefault()
    createRole.mutate(
      { name: name.trim(), resources: Array.from(selected) },
      { onSuccess: handleClose },
    )
  }

  return (
    <Sheet
      isOpen={isOpen}
      onClose={handleClose}
      title="Create Role"
      footer={
        <div className="flex items-center gap-2 w-full">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 px-4 py-2 rounded-lg border hover:bg-accent transition-colors text-sm font-medium"
          >
            Close
          </button>
          <button
            type="submit"
            form="create-role-form"
            disabled={createRole.isPending || !name.trim()}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium disabled:opacity-50"
          >
            {createRole.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {createRole.isPending ? 'Creating…' : 'Create Role'}
          </button>
        </div>
      }
    >
      <form id="create-role-form" onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Role name *</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Content Reviewer"
            className="w-full px-3 py-2.5 border rounded-lg text-sm bg-background focus:outline-hidden focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Permissions</label>
          <p className="text-xs text-muted-foreground">
            Pick what this role can see and do. You can change this any time from its card below.
          </p>
          <div className="border rounded-lg p-4 bg-muted/30">
            <PermissionChecklist groups={resourceGroups} selected={selected} onToggle={toggle} />
          </div>
        </div>

        {createRole.isError && (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-red-50 text-red-700 text-sm font-medium">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {createRole.error?.response?.data?.message || 'Failed to create role.'}
          </div>
        )}
      </form>
    </Sheet>
  )
}
