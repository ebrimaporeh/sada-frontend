import { useEffect, useState } from 'react'
import { ShieldCheck, Users, AlertCircle, CheckCircle2, Loader2, Check } from 'lucide-react'
import { Sheet } from './Sheet'
import { ConfirmModal } from './ConfirmModal'
import { formatDate } from '@/utils/formatters'
import { useUpdateUser, useChangeStaffRole } from '@/hooks/useUsers'
import { useRolePermissions } from '@/hooks/usePermissions'
import { useMe } from '@/hooks/useAuth'
import { ROLES } from '@/constants'
import { RESOURCE_LABELS, roleLabel } from '@/utils/permissions'
import { cn } from '@/utils/cn'

export function StaffSheet({ isOpen, onClose, staff }) {
  const { data: me } = useMe()
  const updateUser = useUpdateUser()
  const changeRole = useChangeStaffRole()
  const { data: rolePermissions } = useRolePermissions()

  // "User" (no admin access) is always offered even though it isn't a row
  // in the runtime Role catalog; every real role option below comes from
  // that live catalog, so a brand-new custom role shows up here with zero
  // extra code.
  const dynamicRoles = rolePermissions?.roles ?? []
  const roleOptions = [
    { value: ROLES.USER, label: 'User', description: 'Campaign dashboard only', icon: Users },
    ...dynamicRoles.map((r) => ({
      value: r.role,
      label: r.label,
      description: r.resources.length > 0
        ? `${r.resources.length} permission${r.resources.length === 1 ? '' : 's'} granted`
        : 'No permissions granted yet',
      icon: ShieldCheck,
    })),
  ]

  // Tracks the committed status locally so the sheet reflects a successful
  // change immediately, without waiting on the parent staff list to refetch
  // and re-pass a fresh `staff` prop.
  const [currentActive, setCurrentActive] = useState(true)
  const [pendingActive, setPendingActive] = useState(null)
  const [targetRole, setTargetRole] = useState(ROLES.USER)
  const [saved, setSaved] = useState(false)
  const [showRoleConfirm, setShowRoleConfirm] = useState(false)

  useEffect(() => {
    if (staff) {
      setCurrentActive(staff.is_active ?? true)
      setPendingActive(null)
      setTargetRole(staff.role)
      setSaved(false)
    }
  }, [staff])

  if (!staff) return null

  const isSelf = me?.id === staff.id
  const isCurrentlyAdmin = staff.role === ROLES.ADMIN
  const roleChanged = targetRole !== staff.role
  // Live, admin-editable resources for the selected role -- see the Staff
  // page's role-permissions editor, which is what this data reflects.
  const previewResources = rolePermissions?.roles.find((r) => r.role === targetRole)?.resources ?? []
  const targetRoleLabel = roleLabel(targetRole, dynamicRoles)

  function handleSave() {
    if (!roleChanged) return
    setShowRoleConfirm(true)
  }

  function confirmRoleChange() {
    changeRole.mutate(
      { id: staff.id, role: targetRole },
      {
        onSuccess: () => {
          setShowRoleConfirm(false)
          setSaved(true)
          setTimeout(() => setSaved(false), 2500)
        },
      },
    )
  }

  function confirmStatusChange() {
    updateUser.mutate(
      { id: staff.id, is_active: pendingActive },
      {
        onSuccess: () => {
          setCurrentActive(pendingActive)
          setPendingActive(null)
          setSaved(true)
          setTimeout(() => setSaved(false), 2500)
        },
      },
    )
  }

  const isPending = updateUser.isPending || changeRole.isPending
  const isError = updateUser.isError || changeRole.isError
  const errorMessage = changeRole.error?.response?.data?.message || updateUser.error?.response?.data?.message || 'Failed to save changes.'

  return (
    <>
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title={staff.full_name || staff.email}
      footer={
        <div className="flex items-center gap-2 w-full">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg border hover:bg-accent transition-colors text-sm font-medium"
          >
            Close
          </button>
          <button
            onClick={handleSave}
            disabled={!roleChanged || isPending}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium disabled:opacity-50"
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {isPending ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="p-3 rounded-lg bg-muted/50 border">
          <label className="text-xs font-semibold text-muted-foreground block mb-1">FULL NAME</label>
          <p className="text-sm font-medium">{staff.full_name || '—'}</p>
        </div>

        <div className="p-3 rounded-lg bg-muted/50 border">
          <label className="text-xs font-semibold text-muted-foreground block mb-1">EMAIL</label>
          <p className="text-sm">{staff.email}</p>
        </div>

        <div className="p-3 rounded-lg bg-muted/50 border">
          <label className="text-xs font-semibold text-muted-foreground block mb-1">PHONE</label>
          <p className="text-sm">{staff.phone || '—'}</p>
        </div>

        {/* Status — dropdown selection applies immediately via its own
            confirmation modal, independent of the Save Changes footer
            button (which only handles the role change below). */}
        <div className="p-3 rounded-lg bg-muted/50 border space-y-2">
          <div className="flex items-center justify-between gap-3">
            <label className="text-xs font-semibold text-muted-foreground">STATUS</label>
            <select
              value={currentActive ? 'active' : 'inactive'}
              onChange={(e) => {
                const next = e.target.value === 'active'
                if (next !== currentActive) setPendingActive(next)
              }}
              disabled={isPending}
              className="text-xs font-medium px-3 py-1.5 rounded-lg border bg-background disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <option value="active">Active</option>
              <option value="inactive" disabled={isSelf}>Inactive</option>
            </select>
          </div>
          {isSelf && (
            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> You can't deactivate your own account.
            </p>
          )}
        </div>

        {/* Role — editable */}
        <div className="p-3 rounded-lg bg-muted/50 border space-y-2">
          <label className="text-xs font-semibold text-muted-foreground block">
            ROLE {isCurrentlyAdmin && <span className="normal-case font-normal">— currently Admin</span>}
          </label>
          <div className="space-y-2">
            {roleOptions.map(({ value, label, description, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setTargetRole(value)}
                disabled={isSelf || isPending}
                className={cn(
                  'w-full flex items-start gap-3 text-left p-3 rounded-xl border transition-colors disabled:opacity-40 disabled:cursor-not-allowed',
                  targetRole === value ? 'border-primary bg-primary/5' : 'hover:bg-muted/50',
                )}
              >
                <Icon className={cn('w-4 h-4 mt-0.5 flex-shrink-0', targetRole === value ? 'text-primary' : 'text-muted-foreground')} />
                <div>
                  <p className="text-xs font-semibold">{label}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{description}</p>
                </div>
              </button>
            ))}
          </div>
          {isSelf && (
            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> You can't change your own role.
            </p>
          )}
          <p className="text-[11px] text-muted-foreground">
            Promoting to Admin isn't available here — that stays a deliberate, separate action.
          </p>
        </div>

        {/* Permissions preview — live, reflects the selected role above */}
        <div className="p-3 rounded-lg bg-muted/50 border space-y-2">
          <label className="text-xs font-semibold text-muted-foreground block">
            {roleChanged ? `PERMISSIONS AS ${targetRoleLabel.toUpperCase()}` : 'CURRENT PERMISSIONS'}
          </label>
          {previewResources.length === 0 ? (
            <p className="text-xs text-muted-foreground">Campaign dashboard only.</p>
          ) : (
            <ul className="space-y-1">
              {previewResources.map((resource) => (
                <li key={resource} className="flex items-center gap-1.5 text-xs">
                  <Check className="w-3 h-3 text-green-600 flex-shrink-0" />
                  {RESOURCE_LABELS[resource] || resource}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="p-3 rounded-lg bg-muted/50 border">
          <label className="text-xs font-semibold text-muted-foreground block mb-1">JOINED</label>
          <p className="text-sm">{formatDate(staff.created_at)}</p>
        </div>

        {isPending && (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-muted text-muted-foreground text-sm font-medium">
            <Loader2 className="w-4 h-4 flex-shrink-0 animate-spin" /> Saving changes…
          </div>
        )}
        {saved && !isPending && (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-green-50 text-green-700 text-sm font-medium">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> Changes saved successfully
          </div>
        )}
        {isError && !isPending && (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-red-50 text-red-700 text-sm font-medium">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {errorMessage}
          </div>
        )}
      </div>
    </Sheet>

    <ConfirmModal
      isOpen={showRoleConfirm}
      onClose={() => setShowRoleConfirm(false)}
      onConfirm={confirmRoleChange}
      title={`Change role to ${targetRoleLabel}?`}
      description={`${staff.email} will move from ${roleLabel(staff.role, dynamicRoles)} to ${targetRoleLabel}. ${
        targetRole === ROLES.USER
          ? 'This revokes all admin panel access.'
          : `They will be able to: ${previewResources.map((r) => RESOURCE_LABELS[r] || r).join(', ')}.`
      }`}
      confirmLabel={`Yes, change to ${targetRoleLabel}`}
      isLoading={changeRole.isPending}
      variant="destructive"
      errorMessage={changeRole.isError ? changeRole.error?.response?.data?.message || 'Failed to change role.' : null}
    />

    <ConfirmModal
      isOpen={pendingActive !== null}
      onClose={() => setPendingActive(null)}
      onConfirm={confirmStatusChange}
      title={`${pendingActive ? 'Reactivate' : 'Deactivate'} ${staff.full_name || staff.email}?`}
      description={
        pendingActive
          ? `${staff.email} will regain access to the admin panel.`
          : `${staff.email} will immediately lose access to the admin panel. This can be reversed at any time.`
      }
      confirmLabel={pendingActive ? 'Yes, reactivate' : 'Yes, deactivate'}
      isLoading={updateUser.isPending}
      variant="destructive"
      errorMessage={updateUser.isError ? updateUser.error?.response?.data?.message || 'Failed to update status.' : null}
    />
    </>
  )
}
