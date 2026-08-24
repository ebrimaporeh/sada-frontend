import { useEffect, useState } from 'react'
import { Loader2, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react'
import { Sheet } from './Sheet'
import { ConfirmModal } from './ConfirmModal'
import { useCreateUser } from '@/hooks/useUsers'
import { useRolePermissions } from '@/hooks/usePermissions'
import { cn } from '@/utils/cn'

const EMPTY_FORM = { email: '', first_name: '', last_name: '', phone: '', role: '' }

export function AddStaffSheet({ isOpen, onClose }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [justCreated, setJustCreated] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const createUser = useCreateUser()
  const { data: rolePermissions } = useRolePermissions()

  // Staff-only — regular users self-register, so "User" isn't an option
  // here. Every role offered comes from the live Role catalog (any admin
  // can create a new one at any time) and grants real admin-panel access,
  // so every submission goes through the confirmation modal below.
  const roleOptions = (rolePermissions?.roles ?? []).map((r) => ({
    value: r.role,
    label: r.label,
    description: r.resources.length > 0
      ? `${r.resources.length} permission${r.resources.length === 1 ? '' : 's'} granted`
      : 'No permissions granted yet',
    icon: ShieldCheck,
  }))

  // Default to the first available role once the catalog loads — can't
  // hardcode a slug like "moderator" any more, an admin may have renamed
  // or deleted it.
  useEffect(() => {
    if (!form.role && roleOptions.length > 0) {
      setForm((f) => ({ ...f, role: roleOptions[0].value }))
    }
  }, [roleOptions, form.role])

  function handleClose() {
    setForm(EMPTY_FORM)
    setJustCreated(false)
    setShowConfirm(false)
    createUser.reset()
    onClose()
  }

  function submitStaff() {
    createUser.mutate(
      {
        email: form.email.trim(),
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        phone: form.phone.trim(),
        role: form.role,
      },
      {
        onSuccess: () => {
          setForm((f) => ({ ...EMPTY_FORM, role: f.role }))
          setJustCreated(true)
          setShowConfirm(false)
          setTimeout(() => setJustCreated(false), 4000)
        },
      },
    )
  }

  function handleSubmit(e) {
    e.preventDefault()
    setShowConfirm(true)
  }

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  const selectedRole = roleOptions.find((r) => r.value === form.role)

  return (
    <>
    <Sheet
      isOpen={isOpen}
      onClose={handleClose}
      title="Add New Staff Member"
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
            form="add-staff-form"
            disabled={createUser.isPending || !form.email.trim() || !form.role}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium disabled:opacity-50"
          >
            {createUser.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {createUser.isPending ? 'Creating…' : 'Create Staff Account'}
          </button>
        </div>
      }
    >
      <form id="add-staff-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Email *</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={set('email')}
            placeholder="name@example.com"
            className="w-full px-3 py-2.5 border rounded-lg text-sm bg-background focus:outline-hidden focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">First Name</label>
            <input
              type="text"
              value={form.first_name}
              onChange={set('first_name')}
              placeholder="Ousman"
              className="w-full px-3 py-2.5 border rounded-lg text-sm bg-background focus:outline-hidden focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Last Name</label>
            <input
              type="text"
              value={form.last_name}
              onChange={set('last_name')}
              placeholder="Camara"
              className="w-full px-3 py-2.5 border rounded-lg text-sm bg-background focus:outline-hidden focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Phone</label>
          <input
            type="tel"
            value={form.phone}
            onChange={set('phone')}
            placeholder="7XXXXXXX"
            className="w-full px-3 py-2.5 border rounded-lg text-sm bg-background focus:outline-hidden focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Role</label>
          {roleOptions.length === 0 ? (
            <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
              No roles exist yet — create one from the Roles & Permissions tab first.
            </p>
          ) : (
            <div className="space-y-2">
              {roleOptions.map(({ value, label, description, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, role: value }))}
                  className={cn(
                    'w-full flex items-start gap-3 text-left p-3 rounded-xl border transition-colors',
                    form.role === value ? 'border-primary bg-primary/5' : 'hover:bg-muted/50',
                  )}
                >
                  <Icon className={cn('w-4 h-4 mt-0.5 flex-shrink-0', form.role === value ? 'text-primary' : 'text-muted-foreground')} />
                  <div>
                    <p className="text-xs font-semibold">{label}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{description}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
          No password is set here — the new staff member gets an email with a link to set their own password.
        </p>

        {justCreated && !createUser.isPending && (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-green-50 text-green-700 text-sm font-medium">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> Staff account created — you can add another below
          </div>
        )}
        {createUser.isError && (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-red-50 text-red-700 text-sm font-medium">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {createUser.error?.response?.data?.message || 'Failed to create staff account.'}
          </div>
        )}
      </form>
    </Sheet>

    <ConfirmModal
      isOpen={showConfirm}
      onClose={() => setShowConfirm(false)}
      onConfirm={submitStaff}
      title={`Grant ${selectedRole?.label} access?`}
      description={`${form.email} will get admin panel access as a ${selectedRole?.label}. ${selectedRole?.description}. Double-check this is who you intend to grant this to.`}
      confirmLabel={`Yes, make them ${selectedRole?.label}`}
      isLoading={createUser.isPending}
      variant="destructive"
      errorMessage={createUser.isError ? createUser.error?.response?.data?.message || 'Failed to create staff account.' : null}
    />
    </>
  )
}
