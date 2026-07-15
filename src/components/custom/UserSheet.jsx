import { useEffect, useRef, useState } from 'react'
import { ShieldCheck, ShieldOff, AlertCircle, CheckCircle2, Loader2, Image as ImageIcon, Building2 } from 'lucide-react'
import { Sheet } from './Sheet'
import { formatDate } from '@/utils/formatters'
import { ROLES, GAMBIA_REGIONS, ORGANIZATION_TYPES, ACCOUNT_TYPES } from '@/constants'
import { useUpdateUser, useUser, useUserVerification } from '@/hooks/useUsers'
import { useMe } from '@/hooks/useAuth'
import { cn } from '@/utils/cn'

const ID_TYPE_LABELS = {
  national_id: 'National ID Card',
  passport: 'Passport',
  drivers_license: "Driver's License",
}

const VERIFICATION_STATUS_BADGE = {
  pending: { label: 'Pending Review', className: 'bg-amber-100 text-amber-700' },
  approved: { label: 'Approved', className: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rejected', className: 'bg-red-100 text-red-700' },
}

export function UserSheet({
  isOpen,
  onClose,
  user: listUser,
}) {
  const { data: me } = useMe()
  const updateUser = useUpdateUser()
  // The row from the users list can be several minutes stale (staleTime: 5m,
  // refetchOnWindowFocus: false) — e.g. right after an admin approves this
  // user's identity verification from a different page/tab. Always refetch
  // the single-user detail on open so Save can't silently clobber a field
  // that changed elsewhere back to its stale value.
  const { data: freshUser } = useUser(listUser?.id)
  const user = freshUser ?? listUser
  const { data: verification } = useUserVerification(listUser?.id, { enabled: isOpen })

  const [isActive, setIsActive] = useState(true)
  const [isVerified, setIsVerified] = useState(false)
  const [saved, setSaved] = useState(false)
  const touchedRef = useRef(false)

  useEffect(() => {
    touchedRef.current = false
  }, [listUser?.id])

  useEffect(() => {
    if (user && !touchedRef.current) {
      setIsActive(user.is_active ?? true)
      setIsVerified(user.is_verified ?? false)
      setSaved(false)
    }
  }, [user])

  if (!user) return null

  const roleName = Object.entries(ROLES).find(([_, val]) => val === user.role)?.[0] || user.role
  const regionLabel = GAMBIA_REGIONS.find((r) => r.value === user.region)?.label || user.region
  const isSelf = me?.id === user.id
  const isOrg = user.account_type === ACCOUNT_TYPES.ORGANIZATION
  const org = user.organization
  const orgTypeLabel = ORGANIZATION_TYPES.find((t) => t.value === org?.organization_type)?.label
  const dirty = isActive !== (user.is_active ?? true) || isVerified !== (user.is_verified ?? false)

  function handleSave() {
    const payload = { id: user.id }
    if (isActive !== (user.is_active ?? true)) payload.is_active = isActive
    if (isVerified !== (user.is_verified ?? false)) payload.is_verified = isVerified

    updateUser.mutate(payload, {
      onSuccess: () => {
        touchedRef.current = false
        setSaved(true)
        setTimeout(() => setSaved(false), 2500)
      },
    })
  }

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title={user?.full_name || user?.email}
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
            disabled={!dirty || updateUser.isPending}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium disabled:opacity-50"
          >
            {updateUser.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {updateUser.isPending ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
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

        {isOrg && org && (
          <div className="p-3 rounded-lg bg-muted/50 border space-y-2.5">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Building2 className="w-3 h-3" /> ORGANIZATION DETAILS
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Type</p>
                <p className="text-sm font-medium">{orgTypeLabel || '—'}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Contact Person</p>
                <p className="text-sm font-medium">{org.contact_person_name || '—'}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Second Phone</p>
                <p className="text-sm font-medium">{org.phone_2 || '—'}</p>
              </div>
            </div>
            {(org.recovery_email_1 || org.recovery_email_2) && (
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Recovery Emails</p>
                {org.recovery_email_1 && <p className="text-sm font-medium">{org.recovery_email_1}</p>}
                {org.recovery_email_2 && <p className="text-sm font-medium">{org.recovery_email_2}</p>}
              </div>
            )}
          </div>
        )}

        {/* Status — editable */}
        <div className="p-3 rounded-lg bg-muted/50 border space-y-2">
          <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            STATUS
            {updateUser.isPending && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />}
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { touchedRef.current = true; setIsActive(true) }}
              disabled={updateUser.isPending}
              className={cn(
                'flex-1 text-xs font-medium px-3 py-2 rounded-lg border transition-colors disabled:opacity-40 disabled:cursor-not-allowed',
                isActive ? 'bg-green-100 text-green-700 border-green-300' : 'hover:bg-accent',
              )}
            >
              Active
            </button>
            <button
              type="button"
              onClick={() => { touchedRef.current = true; setIsActive(false) }}
              disabled={isSelf || updateUser.isPending}
              className={cn(
                'flex-1 text-xs font-medium px-3 py-2 rounded-lg border transition-colors disabled:opacity-40 disabled:cursor-not-allowed',
                !isActive ? 'bg-red-100 text-red-700 border-red-300' : 'hover:bg-accent',
              )}
            >
              Inactive
            </button>
          </div>
          {isSelf && (
            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> You can't deactivate your own account.
            </p>
          )}
        </div>

        {/* Identity verification — editable */}
        <div className="p-3 rounded-lg bg-muted/50 border space-y-2">
          <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            IDENTITY VERIFICATION
            {updateUser.isPending && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />}
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { touchedRef.current = true; setIsVerified(true) }}
              disabled={updateUser.isPending}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border transition-colors disabled:opacity-40 disabled:cursor-not-allowed',
                isVerified ? 'bg-green-100 text-green-700 border-green-300' : 'hover:bg-accent',
              )}
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Verified
            </button>
            <button
              type="button"
              onClick={() => { touchedRef.current = true; setIsVerified(false) }}
              disabled={updateUser.isPending}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border transition-colors disabled:opacity-40 disabled:cursor-not-allowed',
                !isVerified ? 'bg-amber-100 text-amber-700 border-amber-300' : 'hover:bg-accent',
              )}
            >
              <ShieldOff className="w-3.5 h-3.5" /> Not Verified
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Overrides the ID review outcome directly — use the Verifications queue for normal reviews.
          </p>

          {verification && (
            <div className="border-t pt-3 mt-1 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Submitted ID</p>
                <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full', VERIFICATION_STATUS_BADGE[verification.status]?.className)}>
                  {VERIFICATION_STATUS_BADGE[verification.status]?.label || verification.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">ID Type</p>
                  <p className="text-sm font-medium">{ID_TYPE_LABELS[verification.id_type] || verification.id_type || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">ID Number</p>
                  <p className="text-sm font-medium">{verification.id_number || '—'}</p>
                </div>
              </div>
              {verification.status === 'rejected' && verification.rejection_reason && (
                <p className="text-[11px] text-red-700 bg-red-50 border border-red-200 rounded-lg p-2">
                  {verification.rejection_reason}
                </p>
              )}
              {(verification.id_photo_front || verification.id_photo_back) && (
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Front', url: verification.id_photo_front },
                    { label: 'Back', url: verification.id_photo_back },
                  ].filter((p) => p.url).map((p) => (
                    <a key={p.label} href={p.url} target="_blank" rel="noreferrer" className="block group">
                      <div className="rounded-lg overflow-hidden border aspect-video bg-muted">
                        <img
                          src={p.url}
                          alt={`${p.label} of submitted ID`}
                          className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                        <ImageIcon className="w-3 h-3" /> {p.label} photo
                      </p>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-3 rounded-lg bg-muted/50 border">
          <label className="text-xs font-semibold text-muted-foreground block mb-1">JOINED</label>
          <p className="text-sm">{formatDate(user.created_at)}</p>
        </div>

        {updateUser.isPending && (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-muted text-muted-foreground text-sm font-medium">
            <Loader2 className="w-4 h-4 flex-shrink-0 animate-spin" /> Saving changes…
          </div>
        )}
        {saved && !updateUser.isPending && (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-green-50 text-green-700 text-sm font-medium">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> Changes saved successfully
          </div>
        )}
        {updateUser.isError && !updateUser.isPending && (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-red-50 text-red-700 text-sm font-medium">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {updateUser.error?.response?.data?.message || 'Failed to save changes. Please try again.'}
          </div>
        )}
      </div>
    </Sheet>
  )
}
