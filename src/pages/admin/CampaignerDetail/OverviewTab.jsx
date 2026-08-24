import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { ShieldCheck, ShieldOff, AlertCircle, Loader2, Image as ImageIcon, Building2, ArrowRight, Trash2 } from 'lucide-react'
import { Select } from '@/components/custom/Select'
import { ConfirmModal } from '@/components/custom/ConfirmModal'
import { SectionCard } from '../AdminCampaignDetail/shared'
import { formatDate } from '@/utils/formatters'
import { ROLES, GAMBIA_REGIONS, ORGANIZATION_TYPES, ACCOUNT_TYPES, ROUTES } from '@/constants'
import { useUpdateUser, useUserVerification, useUserOrganizationVerification, useDeleteUser } from '@/hooks/useUsers'
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

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

const VERIFIED_OPTIONS = [
  { value: 'verified', label: 'Verified' },
  { value: 'not_verified', label: 'Not Verified' },
]

function InfoField({ label, value }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
      <p className="text-sm font-medium">{value || '—'}</p>
    </div>
  )
}

function StatusControl({ user }) {
  const { data: me } = useMe()
  const updateUser = useUpdateUser()
  const isSelf = me?.id === user.id
  const currentStatus = user.is_active ? 'active' : 'inactive'
  const [pendingStatus, setPendingStatus] = useState(null)

  function handleChange(e) {
    const next = e.target.value
    if (next === currentStatus) return
    setPendingStatus(next)
  }

  function handleConfirm() {
    updateUser.mutate(
      { id: user.id, is_active: pendingStatus === 'active' },
      { onSuccess: () => setPendingStatus(null) },
    )
  }

  const goingInactive = pendingStatus === 'inactive'

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold">Status</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {user.is_active ? 'This account can log in and use the platform normally.' : 'This account is deactivated and cannot log in.'}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {updateUser.isPending && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
          <Select
            value={pendingStatus ?? currentStatus}
            onChange={handleChange}
            options={STATUS_OPTIONS}
            disabled={isSelf || updateUser.isPending}
            className="w-36"
          />
        </div>
      </div>
      {isSelf && (
        <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-2">
          <AlertCircle className="w-3 h-3" /> You can't change your own status.
        </p>
      )}

      <ConfirmModal
        isOpen={Boolean(pendingStatus)}
        onClose={() => setPendingStatus(null)}
        onConfirm={handleConfirm}
        title={goingInactive ? `Deactivate ${user.full_name || user.email}?` : `Activate ${user.full_name || user.email}?`}
        description={
          goingInactive
            ? "They won't be able to log in until reactivated. Their campaigns and data stay untouched."
            : 'They will regain full access and be able to log in again.'
        }
        confirmLabel={goingInactive ? 'Deactivate' : 'Activate'}
        variant={goingInactive ? 'destructive' : 'primary'}
        isLoading={updateUser.isPending}
        errorMessage={updateUser.isError ? updateUser.error?.response?.data?.message || 'Failed to update status.' : null}
      />
    </>
  )
}

function VerificationStatusControl({ user }) {
  const updateUser = useUpdateUser()
  const currentStatus = user.is_verified ? 'verified' : 'not_verified'
  const [pendingStatus, setPendingStatus] = useState(null)

  function handleChange(e) {
    const next = e.target.value
    if (next === currentStatus) return
    setPendingStatus(next)
  }

  function handleConfirm() {
    updateUser.mutate(
      { id: user.id, is_verified: pendingStatus === 'verified' },
      { onSuccess: () => setPendingStatus(null) },
    )
  }

  const revoking = pendingStatus === 'not_verified'

  return (
    <>
      <div className="flex items-center justify-between gap-4 mb-4">
        <span className={cn(
          'inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full',
          user.is_verified ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700',
        )}>
          {user.is_verified ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldOff className="w-3.5 h-3.5" />}
          {user.is_verified ? 'Verified' : 'Not Verified'}
        </span>
        <div className="flex items-center gap-2 flex-shrink-0">
          {updateUser.isPending && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
          <Select
            value={pendingStatus ?? currentStatus}
            onChange={handleChange}
            options={VERIFIED_OPTIONS}
            disabled={updateUser.isPending}
            className="w-40"
          />
        </div>
      </div>

      <ConfirmModal
        isOpen={Boolean(pendingStatus)}
        onClose={() => setPendingStatus(null)}
        onConfirm={handleConfirm}
        title={revoking ? `Mark ${user.full_name || user.email} as not verified?` : `Verify ${user.full_name || user.email}?`}
        description={
          revoking
            ? "This removes their verified badge and also revokes their submitted ID's approval, if it was approved. Their submitted ID stays on file."
            : "This directly sets their verified status, independent of the submitted ID's own review status below."
        }
        confirmLabel={revoking ? 'Remove Verification' : 'Mark Verified'}
        variant={revoking ? 'destructive' : 'primary'}
        isLoading={updateUser.isPending}
        errorMessage={updateUser.isError ? updateUser.error?.response?.data?.message || 'Failed to update verification status.' : null}
      />
    </>
  )
}

function DeleteAccountControl({ user }) {
  const { data: me } = useMe()
  const navigate = useNavigate()
  const deleteUser = useDeleteUser()
  const isSelf = me?.id === user.id
  const [confirming, setConfirming] = useState(false)
  const isOrg = user.account_type === ACCOUNT_TYPES.ORGANIZATION

  function handleConfirm() {
    deleteUser.mutate(user.id, {
      onSuccess: () => navigate({ to: ROUTES.ADMIN_USERS }),
    })
  }

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold">Delete Account</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Removes {isOrg ? 'this organization' : 'this user'}'s personal information and login access. Their campaigns
            and donation records are kept for financial record-keeping, with personal details removed.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setConfirming(true)}
          disabled={isSelf}
          className="flex-shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold text-red-700 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
        >
          <Trash2 className="w-3.5 h-3.5" /> Delete
        </button>
      </div>
      {isSelf && (
        <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-2">
          <AlertCircle className="w-3 h-3" /> You can't delete your own account.
        </p>
      )}

      <ConfirmModal
        isOpen={confirming}
        onClose={() => setConfirming(false)}
        onConfirm={handleConfirm}
        title={`Delete ${user.full_name || user.email}?`}
        description="This permanently removes their name, email, phone, and other personal details, and they will no longer be able to log in. This cannot be undone. Their campaigns and donation records stay on file for financial record-keeping."
        confirmLabel="Delete Account"
        variant="destructive"
        isLoading={deleteUser.isPending}
        errorMessage={deleteUser.isError ? deleteUser.error?.response?.data?.message || 'Failed to delete account.' : null}
      />
    </>
  )
}

function IdPhotos({ front, back }) {
  if (!front && !back) return null
  return (
    <div className="grid grid-cols-2 gap-3">
      {[{ label: 'Front', url: front }, { label: 'Back', url: back }].filter((p) => p.url).map((p) => (
        <a key={p.label} href={p.url} target="_blank" rel="noreferrer" className="block group">
          <div className="rounded-lg overflow-hidden border aspect-video bg-muted">
            <img src={p.url} alt={`${p.label} of submitted ID`} className="w-full h-full object-cover group-hover:opacity-80 transition-opacity" />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
            <ImageIcon className="w-3 h-3" /> {p.label} photo
          </p>
        </a>
      ))}
    </div>
  )
}

export function OverviewTab({ user }) {
  const roleName = Object.entries(ROLES).find(([, val]) => val === user.role)?.[0]?.toLowerCase().replace('_', ' ')
  const regionLabel = GAMBIA_REGIONS.find((r) => r.value === user.region)?.label || user.region
  const isOrg = user.account_type === ACCOUNT_TYPES.ORGANIZATION
  const org = user.organization
  const orgTypeLabel = ORGANIZATION_TYPES.find((t) => t.value === org?.organization_type)?.label

  const { data: verification } = useUserVerification(user.id)
  const { data: orgVerification } = useUserOrganizationVerification(user.id, { enabled: isOrg })

  return (
    <div className="space-y-6">
      <SectionCard title="Account Information">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <InfoField label="Full Name" value={user.full_name} />
          <InfoField label="Email" value={user.email} />
          <InfoField label="Phone" value={user.phone} />
          <InfoField label="Role" value={roleName} />
          <InfoField label="Region" value={regionLabel} />
          <InfoField label="Joined" value={formatDate(user.created_at)} />
        </div>
      </SectionCard>

      {isOrg && org && (
        <SectionCard title="Organization Details">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Building2 className="w-4 h-4" /> {orgTypeLabel || 'Organization'}
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <InfoField label="Organization Name" value={org.organization_name} />
            <InfoField label="Contact Person" value={org.contact_person_name} />
            <InfoField label="Second Phone" value={org.phone_2} />
            <InfoField label="Recovery Email 1" value={org.recovery_email_1} />
            <InfoField label="Recovery Email 2" value={org.recovery_email_2} />
          </div>
        </SectionCard>
      )}

      <SectionCard>
        <StatusControl user={user} />
      </SectionCard>

      <SectionCard title="Identity Verification">
        <VerificationStatusControl user={user} />

        {verification ? (
          <div className="space-y-3 border-t pt-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Submitted ID</p>
              <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full', VERIFICATION_STATUS_BADGE[verification.status]?.className)}>
                {VERIFICATION_STATUS_BADGE[verification.status]?.label || verification.status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <InfoField label="ID Type" value={ID_TYPE_LABELS[verification.id_type] || verification.id_type} />
              <InfoField label="ID Number" value={verification.id_number} />
            </div>
            {verification.status === 'rejected' && verification.rejection_reason && (
              <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg p-2.5">
                {verification.rejection_reason}
              </p>
            )}
            <IdPhotos front={verification.id_photo_front} back={verification.id_photo_back} />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground border-t pt-4">No ID has been submitted for review yet.</p>
        )}
      </SectionCard>

      {isOrg && (
        <SectionCard
          title="Organization Verification"
          action={
            <Link to="/admin/verifications" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
              Verifications queue <ArrowRight className="w-3 h-3" />
            </Link>
          }
        >
          {orgVerification ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Submitted Documents</p>
                <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full', VERIFICATION_STATUS_BADGE[orgVerification.status]?.className)}>
                  {VERIFICATION_STATUS_BADGE[orgVerification.status]?.label || orgVerification.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <InfoField label="Contact ID Type" value={ID_TYPE_LABELS[orgVerification.contact_id_type] || orgVerification.contact_id_type} />
                <InfoField label="Contact ID Number" value={orgVerification.contact_id_number} />
              </div>
              {orgVerification.status === 'rejected' && orgVerification.rejection_reason && (
                <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg p-2.5">
                  {orgVerification.rejection_reason}
                </p>
              )}
              <IdPhotos front={orgVerification.contact_id_photo_front} back={orgVerification.contact_id_photo_back} />
              {(orgVerification.registration_document || orgVerification.organization_photo) && (
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Registration Document', url: orgVerification.registration_document },
                    { label: 'Organization Photo', url: orgVerification.organization_photo },
                  ].filter((d) => d.url).map((d) => (
                    <a key={d.label} href={d.url} target="_blank" rel="noreferrer" className="block group">
                      <div className="rounded-lg overflow-hidden border aspect-video bg-muted">
                        <img src={d.url} alt={d.label} className="w-full h-full object-cover group-hover:opacity-80 transition-opacity" />
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                        <ImageIcon className="w-3 h-3" /> {d.label}
                      </p>
                    </a>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No organization documents have been submitted for review yet.</p>
          )}
        </SectionCard>
      )}

      <SectionCard title="Danger Zone" className="border-red-200">
        <DeleteAccountControl user={user} />
      </SectionCard>
    </div>
  )
}
