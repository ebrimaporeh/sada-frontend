import { useState } from 'react'
import { AlertCircle, Clock, Mail, UserCheck, ImageIcon, Loader2 } from 'lucide-react'
import { useMyOrganizationChangeRequests, useSubmitOrganizationChangeRequest } from '@/hooks/useUsers'
import { useMyOrganizationMembership, useUpdateOrganization, useUploadOrganizationCover } from '@/hooks/useOrganizations'
import { OrganizationPermission } from '@/constants'
import { initials } from '@/utils/formatters'

const CHANGEABLE_FIELD_LABELS = {
  phone: 'Primary Phone Number',
  phone_2: 'Second Phone Number',
  recovery_email_1: 'Recovery Email 1',
  recovery_email_2: 'Recovery Email 2',
}

// Recovery emails skip review entirely -- submitting one sends a
// confirmation link to the *new* address instead, and the change applies
// the moment that's clicked. Phone numbers go through a pending
// admin-reviewed request. Same component either way; only the copy and
// pending-state icon differ. Mirrors the pattern this replaced in
// UserProfile.jsx, just organization-scoped now instead of user-scoped.
function ChangeableField({ organizationId, fieldName, label, currentValue, pendingRequest, type = 'text', canManage }) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState('')
  const [error, setError] = useState('')
  const [justSubmittedTo, setJustSubmittedTo] = useState('')
  const submitChange = useSubmitOrganizationChangeRequest(organizationId)
  const isEmailField = type === 'email'

  function startEdit() {
    setValue(currentValue || '')
    setError('')
    setJustSubmittedTo('')
    setEditing(true)
  }

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const proposedValue = value.trim()
    submitChange.mutate(
      { field_name: fieldName, proposed_value: proposedValue },
      {
        onSuccess: () => {
          setEditing(false)
          if (isEmailField) setJustSubmittedTo(proposedValue)
        },
        onError: (err) => setError(err?.response?.data?.message || 'Failed to submit change request.'),
      },
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">{label}</p>
        {canManage && !editing && !pendingRequest && (
          <button type="button" onClick={startEdit} className="text-xs text-primary hover:underline font-medium flex-shrink-0">
            Change
          </button>
        )}
      </div>

      {editing ? (
        <form onSubmit={handleSubmit} className="space-y-1.5 mt-1">
          <input
            type={type}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoFocus
            className="w-full px-2.5 py-1.5 border rounded-lg text-sm bg-background focus:outline-hidden focus:ring-2 focus:ring-ring"
          />
          {error && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="w-3 h-3 flex-shrink-0" /> {error}
            </p>
          )}
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={submitChange.isPending || !value.trim()}
              className="text-xs bg-primary text-primary-foreground font-medium px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {submitChange.isPending
                ? (isEmailField ? 'Sending…' : 'Submitting…')
                : (isEmailField ? 'Send confirmation link' : 'Submit for approval')}
            </button>
            <button type="button" onClick={() => setEditing(false)} disabled={submitChange.isPending} className="text-xs text-muted-foreground hover:text-foreground px-2 py-1.5">
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <p className="font-medium">{currentValue || '—'}</p>
          {pendingRequest ? (
            isEmailField ? (
              <p className="text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-2 py-1 mt-1 flex items-center gap-1.5">
                <Mail className="w-3 h-3 flex-shrink-0" /> Awaiting confirmation from {pendingRequest.proposed_value}
              </p>
            ) : (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1 mt-1 flex items-center gap-1.5">
                <Clock className="w-3 h-3 flex-shrink-0" /> Pending review: {pendingRequest.proposed_value}
              </p>
            )
          ) : justSubmittedTo && (
            <p className="text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-2 py-1 mt-1 flex items-center gap-1.5">
              <Mail className="w-3 h-3 flex-shrink-0" /> Confirmation link sent to {justSubmittedTo}
            </p>
          )}
        </>
      )}
    </div>
  )
}

// Contact persons are real members (see OrganizationMembers for adding/removing the
// flag) -- this is a read-only summary, each one's own name/email/phone
// straight from their User account, not a free-text field that can drift
// from who's actually reachable.
function ContactPersonsList({ contactPersons }) {
  if (!contactPersons || contactPersons.length === 0) {
    return <p className="text-sm text-muted-foreground">No contact people set yet -- add one from the Members tab.</p>
  }
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {contactPersons.map((c) => (
        <div key={c.user_id} className="flex items-center gap-3 border rounded-xl p-3">
          <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
            {initials(c.name)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{c.name}</p>
            <p className="text-xs text-muted-foreground truncate">{c.email}{c.phone ? ` · ${c.phone}` : ''}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// What shows on the public /give/<slug> donation page -- description and
// cover image, both directly editable (unlike phone/recovery email above)
// since neither is account-recovery-critical, see
// organization_service.update_organization/upload_cover_image.
function DonationPageSettings({ organization, canManage }) {
  const [description, setDescription] = useState(organization.description || '')
  const [error, setError] = useState('')
  const updateOrganization = useUpdateOrganization(organization.id)
  const uploadCover = useUploadOrganizationCover(organization.id)

  function handleSaveDescription(e) {
    e.preventDefault()
    setError('')
    updateOrganization.mutate(
      { description },
      { onError: (err) => setError(err?.response?.data?.message || 'Failed to save.') },
    )
  }

  function handleCoverChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    uploadCover.mutate(file, {
      onError: (err) => setError(err?.response?.data?.message || 'Failed to upload cover image.'),
    })
  }

  return (
    <div className="border rounded-2xl p-6 bg-card space-y-4">
      <div>
        <h2 className="font-semibold text-base">Donation Page</h2>
        <p className="text-xs text-muted-foreground mt-1">
          What donors see at your public donation link (see the Donations tab for that URL) — a short description and
          a cover image.
        </p>
      </div>

      <div>
        <label className="text-xs text-muted-foreground block mb-1.5">Description</label>
        {canManage ? (
          <form onSubmit={handleSaveDescription} className="space-y-2">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={2000}
              rows={3}
              placeholder="Tell donors what their contribution supports…"
              className="w-full px-3 py-2 border rounded-lg text-sm bg-background focus:outline-hidden focus:ring-2 focus:ring-ring resize-none"
            />
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={updateOrganization.isPending}
                className="text-xs bg-primary text-primary-foreground font-medium px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {updateOrganization.isPending ? 'Saving…' : 'Save'}
              </button>
              {updateOrganization.isSuccess && <span className="text-xs text-green-700">Saved</span>}
            </div>
          </form>
        ) : (
          <p className="text-sm">{organization.description || '—'}</p>
        )}
      </div>

      {canManage && (
        <div>
          <label className="text-xs text-muted-foreground block mb-1.5">Cover image</label>
          <div className="flex items-center gap-3">
            <div className="w-24 h-16 rounded-lg bg-muted overflow-hidden flex items-center justify-center flex-shrink-0">
              {organization.cover_image ? (
                <img src={organization.cover_image} alt="Cover" className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
            <label className="text-xs font-medium text-primary hover:underline cursor-pointer inline-flex items-center gap-1.5">
              {uploadCover.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {uploadCover.isPending ? 'Uploading…' : 'Upload new cover'}
              <input type="file" accept="image/*" className="hidden" onChange={handleCoverChange} disabled={uploadCover.isPending} />
            </label>
          </div>
        </div>
      )}

      {error && (
        <p className="text-xs text-destructive flex items-center gap-1">
          <AlertCircle className="w-3 h-3 flex-shrink-0" /> {error}
        </p>
      )}
    </div>
  )
}

export function OrganizationSettings({ organization }) {
  const { data: changeRequests } = useMyOrganizationChangeRequests()
  const myMembership = useMyOrganizationMembership(organization.id)
  const canManage = myMembership?.permissions?.includes(OrganizationPermission.MANAGE_ORGANIZATION)
  const pendingRequestFor = (fieldName) =>
    changeRequests?.find((r) => r.organization_id === organization.id && r.field_name === fieldName && r.status === 'pending')

  return (
    <div className="space-y-6">
      <div className="border rounded-2xl p-6 bg-card space-y-4">
        <div>
          <h2 className="font-semibold text-base flex items-center gap-2">
            <UserCheck className="w-4 h-4" /> Contact People
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Anyone reaching out about this organization should be able to reach one of these people. Add or remove
            contact people from the Members tab.
          </p>
        </div>
        <ContactPersonsList contactPersons={organization.contact_persons} />
      </div>

      <DonationPageSettings organization={organization} canManage={canManage} />

      <div className="border rounded-2xl p-6 bg-card space-y-4">
        <div>
          <h2 className="font-semibold text-base">Organization Details</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Name and type were set at creation and aren't editable here. Phone number changes need admin approval.
            Recovery emails are different — changing one sends a confirmation link to the new address, and it takes
            effect as soon as that link is clicked, with no admin involved. Either way nothing changes until the
            request resolves.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 pt-1">
          <div>
            <p className="text-xs text-muted-foreground">Organization Name</p>
            <p className="font-medium text-sm">{organization.organization_name}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Type</p>
            <p className="font-medium text-sm capitalize">{organization.organization_type_name}</p>
          </div>
          <div className="hidden lg:block" />
          <ChangeableField
            organizationId={organization.id}
            fieldName="phone"
            label={CHANGEABLE_FIELD_LABELS.phone}
            currentValue={organization.phone}
            pendingRequest={pendingRequestFor('phone')}
            type="tel"
            canManage={canManage}
          />
          <ChangeableField
            organizationId={organization.id}
            fieldName="phone_2"
            label={CHANGEABLE_FIELD_LABELS.phone_2}
            currentValue={organization.phone_2}
            pendingRequest={pendingRequestFor('phone_2')}
            type="tel"
            canManage={canManage}
          />
          <div className="hidden lg:block" />
          <ChangeableField
            organizationId={organization.id}
            fieldName="recovery_email_1"
            label={CHANGEABLE_FIELD_LABELS.recovery_email_1}
            currentValue={organization.recovery_email_1}
            pendingRequest={pendingRequestFor('recovery_email_1')}
            type="email"
            canManage={canManage}
          />
          <ChangeableField
            organizationId={organization.id}
            fieldName="recovery_email_2"
            label={CHANGEABLE_FIELD_LABELS.recovery_email_2}
            currentValue={organization.recovery_email_2}
            pendingRequest={pendingRequestFor('recovery_email_2')}
            type="email"
            canManage={canManage}
          />
        </div>
      </div>
    </div>
  )
}
