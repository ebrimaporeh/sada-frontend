import { useState, useEffect } from 'react'
import { ShieldCheck, Upload, AlertCircle, Clock, CheckCircle2, XCircle, X, Image as ImageIcon, ZoomIn } from 'lucide-react'
import { useMyOrganizationVerification, useSubmitOrganizationVerification } from '@/hooks/useUsers'
import { formatDate } from '@/utils/formatters'
import { ImageZoomModal } from '@/components/custom/ImageZoomModal'
import { compressImage } from '@/utils/imageCompression'

const STATUS_BADGE = {
  pending: { label: 'Under Review', icon: Clock, className: 'bg-amber-100 text-amber-700' },
  approved: { label: 'Approved', icon: CheckCircle2, className: 'bg-green-100 text-green-700' },
  rejected: { label: 'Not Approved', icon: XCircle, className: 'bg-red-100 text-red-700' },
}

function FilePicker({ label, file, onChange, required }) {
  const [preview, setPreview] = useState(null)

  async function handleFileInput(e) {
    const selected = e.target.files?.[0]
    e.target.value = ''
    if (!selected) {
      onChange(null)
      return
    }
    onChange(await compressImage(selected, 'document'))
  }

  useEffect(() => {
    if (!file) {
      setPreview(null)
      return
    }
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}{required && <span className="text-destructive"> *</span>}</label>
      {preview ? (
        <div className="relative group rounded-lg overflow-hidden border">
          <img src={preview} alt={label} className="w-full h-32 object-cover" />
          <label className="absolute inset-0 flex items-center justify-center gap-1.5 bg-black/0 group-hover:bg-black/50 opacity-0 group-hover:opacity-100 transition-all cursor-pointer text-white text-xs font-medium">
            <Upload className="w-3.5 h-3.5" /> Replace
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileInput}
            />
          </label>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <p className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-[10px] px-2 py-1 truncate">{file.name}</p>
        </div>
      ) : (
        <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed rounded-lg hover:border-primary/50 cursor-pointer transition-colors text-sm">
          <Upload className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <span className="text-muted-foreground truncate">Click to upload photo</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileInput}
          />
        </label>
      )}
    </div>
  )
}

function SubmittedDocs({ verification }) {
  const [zoomedPhoto, setZoomedPhoto] = useState(null)

  const docs = [
    { label: 'Registration Certificate', url: verification?.registration_document },
    { label: 'Organization Photo', url: verification?.organization_photo },
  ].filter((d) => d.url)

  if (!docs.length) return null

  return (
    <>
      <div className="grid grid-cols-2 gap-3 max-w-md">
        {docs.map((d) => (
          <button
            key={d.label}
            type="button"
            onClick={() => setZoomedPhoto(d)}
            className="block group text-left"
          >
            <div className="relative rounded-lg overflow-hidden border bg-muted">
              <img
                src={d.url}
                alt={d.label}
                className="w-full h-40 object-contain"
              />
              <span className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <ZoomIn className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
              <ImageIcon className="w-3 h-3" /> {d.label}
            </p>
          </button>
        ))}
      </div>

      <ImageZoomModal
        isOpen={!!zoomedPhoto}
        onClose={() => setZoomedPhoto(null)}
        src={zoomedPhoto?.url}
        alt={zoomedPhoto?.label}
      />
    </>
  )
}

function VerificationDetails({ verification }) {
  if (!verification) return null

  return (
    <div className="space-y-3">
      <div>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Registration Number</p>
        <p className="text-sm font-medium">{verification.registration_number || '—'}</p>
      </div>
      <SubmittedDocs verification={verification} />
    </div>
  )
}

// `organization` is the caller's own me.organizations entry for this org
// (has is_verified, same shape OrganizationSerializer returns) -- this
// section no longer assumes "the org" the way it did when Organization was
// 1:1 with User; it's always scoped to one specific organization the
// caller currently has open (see OrganizationDetail/SettingsTab).
//
// Verifies the organization's own registration -- a certificate/number, not
// any individual member's personal ID (that's IdentityVerification, a
// separate, per-person flow). Which member happens to submit this doesn't
// matter; what's being proven is that the org itself is real.
export function OrganizationVerificationSection({ organization }) {
  const { data: verification, isLoading } = useMyOrganizationVerification(organization.id)
  const submitVerification = useSubmitOrganizationVerification(organization.id)

  const [registrationNumber, setRegistrationNumber] = useState('')
  const [registrationDocument, setRegistrationDocument] = useState(null)
  const [organizationPhoto, setOrganizationPhoto] = useState(null)
  const [showForm, setShowForm] = useState(false)

  function resetForm() {
    setRegistrationNumber('')
    setRegistrationDocument(null)
    setOrganizationPhoto(null)
  }

  function handleSubmit(e) {
    e.preventDefault()
    submitVerification.mutate(
      {
        registration_number: registrationNumber,
        registration_document: registrationDocument,
        organization_photo: organizationPhoto,
      },
      {
        onSuccess: () => {
          setShowForm(false)
          resetForm()
        },
      },
    )
  }

  const canSubmitNew = !organization.is_verified && (!verification || verification.status === 'rejected')
  // Only fall back to the verification record's own status for pending/rejected —
  // never show "Approved" here when organization.is_verified is false. is_verified
  // is the single source of truth for the verified grant; a stale/desynced
  // approved record must never contradict it in the UI.
  const badge = verification && verification.status !== 'approved' ? STATUS_BADGE[verification.status] : null

  return (
    <div className="border rounded-2xl p-6 bg-card space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="font-semibold text-base">Organization Verification</h2>
        {organization.is_verified ? (
          <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Verified
          </span>
        ) : badge ? (
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 ${badge.className}`}>
            <badge.icon className="w-3.5 h-3.5" /> {badge.label}
          </span>
        ) : (
          <span className="text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-medium">Not verified</span>
        )}
      </div>

      <p className="text-sm text-muted-foreground">
        Verified organizations build more trust with donors. Submit your registration certificate and a photo of
        your organization to get the verification badge.
      </p>

      {isLoading ? null : organization.is_verified ? (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Your organization was verified{verification?.reviewed_at ? ` on ${formatDate(verification.reviewed_at)}` : ''}.
          </p>
          {verification && <VerificationDetails verification={verification} />}
        </div>
      ) : verification && verification.status === 'pending' ? (
        <div className="text-xs text-muted-foreground border rounded-lg p-3 bg-muted/30 space-y-3">
          <div className="space-y-1">
            <p>Submitted {formatDate(verification.created_at)}.</p>
            <p>We'll email you once it's been reviewed.</p>
          </div>
          <VerificationDetails verification={verification} />
        </div>
      ) : verification && verification.status === 'rejected' && !showForm ? (
        <div className="text-xs space-y-3">
          <div className="border border-red-200 bg-red-50 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-red-800 font-medium">Your last submission wasn't approved.</p>
              {verification.rejection_reason && <p className="text-red-700 mt-0.5">{verification.rejection_reason}</p>}
            </div>
          </div>
          <VerificationDetails verification={verification} />
        </div>
      ) : null}

      {canSubmitNew && !showForm && (
        <button
          type="button"
          onClick={() => { resetForm(); setShowForm(true) }}
          className="inline-flex items-center gap-2 border font-medium px-4 py-2 rounded-xl hover:bg-muted transition-colors text-sm"
        >
          <ShieldCheck className="w-4 h-4" /> {verification?.status === 'rejected' ? 'Resubmit for Verification' : 'Submit for Verification'}
        </button>
      )}

      {canSubmitNew && showForm && (
        <form onSubmit={handleSubmit} className="space-y-4 border-t pt-4">
          {submitVerification.isError && (
            <p className="text-xs text-destructive bg-destructive/10 rounded-lg p-2">
              {submitVerification.error?.response?.data?.message || 'Failed to submit. Please try again.'}
            </p>
          )}

          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Registration Proof</p>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Registration Number</label>
            <input
              type="text"
              value={registrationNumber}
              onChange={(e) => setRegistrationNumber(e.target.value)}
              required
              placeholder="The number printed on your certificate"
              className="w-full px-3 py-2.5 border rounded-lg text-sm bg-background focus:outline-hidden focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <FilePicker label="Registration Certificate" file={registrationDocument} onChange={setRegistrationDocument} required />
            <FilePicker label="Organization Photo" file={organizationPhoto} onChange={setOrganizationPhoto} required />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 px-4 py-2 rounded-lg border hover:bg-accent transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                submitVerification.isPending || !registrationNumber.trim() || !registrationDocument || !organizationPhoto
              }
              className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium disabled:opacity-50"
            >
              {submitVerification.isPending ? 'Submitting…' : 'Submit for Review'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
