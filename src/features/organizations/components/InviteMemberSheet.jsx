import { useEffect, useState } from 'react'
import { Loader2, AlertCircle, CheckCircle2, KeyRound } from 'lucide-react'
import { Sheet } from '@/components/custom/Sheet'
import { useInviteMember } from '@/hooks/useOrganizations'
import { cn } from '@/utils/cn'

const EMPTY_FORM = { email: '', roleId: '' }

// Roles are the org's own non-Owner roles (Owner is granted only via
// transfer, never invitation -- see organization_service.invite_member).
export function InviteMemberSheet({ isOpen, onClose, organizationId, roles }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [justInvited, setJustInvited] = useState(false)
  const inviteMember = useInviteMember(organizationId)

  useEffect(() => {
    if (!form.roleId && roles.length > 0) {
      setForm((f) => ({ ...f, roleId: roles[0].id }))
    }
  }, [roles, form.roleId])

  function handleClose() {
    setForm(EMPTY_FORM)
    setJustInvited(false)
    inviteMember.reset()
    onClose()
  }

  function handleSubmit(e) {
    e.preventDefault()
    inviteMember.mutate(
      { email: form.email.trim(), roleId: form.roleId },
      {
        onSuccess: () => {
          setForm((f) => ({ ...EMPTY_FORM, roleId: f.roleId }))
          setJustInvited(true)
          setTimeout(() => setJustInvited(false), 4000)
        },
      },
    )
  }

  return (
    <Sheet
      isOpen={isOpen}
      onClose={handleClose}
      title="Invite a Member"
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
            form="invite-member-form"
            disabled={inviteMember.isPending || !form.email.trim() || !form.roleId}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium disabled:opacity-50"
          >
            {inviteMember.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {inviteMember.isPending ? 'Sending…' : 'Send Invitation'}
          </button>
        </div>
      }
    >
      <form id="invite-member-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Email *</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="name@example.com"
            className="w-full px-3 py-2.5 border rounded-lg text-sm bg-background focus:outline-hidden focus:ring-2 focus:ring-ring"
          />
          <p className="text-xs text-muted-foreground">
            If they don't have an account yet, they'll be asked to create one with this email before joining.
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Role</label>
          {roles.length === 0 ? (
            <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
              No roles available -- create one from the Roles tab first.
            </p>
          ) : (
            <div className="space-y-2">
              {roles.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, roleId: role.id }))}
                  className={cn(
                    'w-full flex items-start gap-3 text-left p-3 rounded-xl border transition-colors',
                    form.roleId === role.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50',
                  )}
                >
                  <KeyRound className={cn('w-4 h-4 mt-0.5 flex-shrink-0', form.roleId === role.id ? 'text-primary' : 'text-muted-foreground')} />
                  <div>
                    <p className="text-xs font-semibold">{role.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {role.permissions.length > 0
                        ? `${role.permissions.length} permission${role.permissions.length === 1 ? '' : 's'} granted`
                        : 'No permissions granted'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {justInvited && !inviteMember.isPending && (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-green-50 text-green-700 text-sm font-medium">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> Invitation sent — you can invite another below
          </div>
        )}
        {inviteMember.isError && (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-red-50 text-red-700 text-sm font-medium">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {inviteMember.error?.response?.data?.message || 'Failed to send invitation.'}
          </div>
        )}
      </form>
    </Sheet>
  )
}
