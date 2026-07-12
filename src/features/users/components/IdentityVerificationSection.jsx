import { useEffect, useState } from 'react'
import { ShieldCheck, Upload, AlertCircle, Clock, CheckCircle2, XCircle, X, Image as ImageIcon } from 'lucide-react'
import { useMe } from '@/hooks/useAuth'
import { useMyVerification, useSubmitVerification } from '@/hooks/useUsers'
import { formatDate } from '@/utils/formatters'

const ID_TYPES = [
  { value: 'national_id', label: 'National ID Card' },
  { value: 'passport', label: 'Passport' },
  { value: 'drivers_license', label: "Driver's License" },
]

const STATUS_BADGE = {
  pending: { label: 'Under Review', icon: Clock, className: 'bg-amber-100 text-amber-700' },
  approved: { label: 'Approved', icon: CheckCircle2, className: 'bg-green-100 text-green-700' },
  rejected: { label: 'Not Approved', icon: XCircle, className: 'bg-red-100 text-red-700' },
}

function FilePicker({ label, file, onChange, required }) {
  const [preview, setPreview] = useState(null)

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
              onChange={(e) => onChange(e.target.files?.[0] || null)}
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
            onChange={(e) => onChange(e.target.files?.[0] || null)}
          />
        </label>
      )}
    </div>
  )
}

function SubmittedPhotos({ verification }) {
  const photos = [
    { label: 'Front', url: verification?.id_photo_front },
    { label: 'Back', url: verification?.id_photo_back },
  ].filter((p) => p.url)

  if (!photos.length) return null

  return (
    <div className="grid grid-cols-2 gap-3 max-w-xs">
      {photos.map((p) => (
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
  )
}

function VerificationDetails({ verification }) {
  if (!verification) return null

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 max-w-xs">
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">ID Type</p>
          <p className="text-sm font-medium">{ID_TYPES.find((t) => t.value === verification.id_type)?.label || verification.id_type || '—'}</p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">ID Number</p>
          <p className="text-sm font-medium">{verification.id_number || '—'}</p>
        </div>
      </div>
      <SubmittedPhotos verification={verification} />
    </div>
  )
}

export function IdentityVerificationSection() {
  const { data: user } = useMe()
  const { data: verification, isLoading } = useMyVerification()
  const submitVerification = useSubmitVerification()

  const [idType, setIdType] = useState('national_id')
  const [idNumber, setIdNumber] = useState('')
  const [photoFront, setPhotoFront] = useState(null)
  const [photoBack, setPhotoBack] = useState(null)
  const [showForm, setShowForm] = useState(false)

  const needsBack = idType !== 'passport'

  function handleSubmit(e) {
    e.preventDefault()
    submitVerification.mutate(
      {
        id_type: idType,
        id_number: idNumber,
        id_photo_front: photoFront,
        id_photo_back: needsBack ? photoBack : undefined,
      },
      {
        onSuccess: () => {
          setShowForm(false)
          setIdNumber('')
          setPhotoFront(null)
          setPhotoBack(null)
        },
      },
    )
  }

  const canSubmitNew = !user?.is_verified && (!verification || verification.status === 'rejected')
  // Only fall back to the verification record's own status for pending/rejected —
  // never show "Approved" here when user.is_verified is false. is_verified is the
  // single source of truth for the verified grant; a stale/desynced approved
  // record must never contradict it in the UI.
  const badge = verification && verification.status !== 'approved' ? STATUS_BADGE[verification.status] : null

  return (
    <div className="border rounded-2xl p-6 bg-card space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="font-semibold text-base">Identity Verification</h2>
        {user?.is_verified ? (
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
        Verified campaign owners build more trust with donors. Upload a government-issued ID to get a verification badge on your campaigns.
      </p>

      {isLoading ? null : user?.is_verified ? (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Your identity was verified{verification?.reviewed_at ? ` on ${formatDate(verification.reviewed_at)}` : ''}.
          </p>
          <VerificationDetails verification={verification} />
        </div>
      ) : verification && verification.status === 'pending' ? (
        <div className="text-xs text-muted-foreground border rounded-lg p-3 bg-muted/30 space-y-3">
          <div className="space-y-1">
            <p>Submitted {formatDate(verification.created_at)} — {ID_TYPES.find((t) => t.value === verification.id_type)?.label}.</p>
            <p>We'll email you once it's been reviewed.</p>
          </div>
          <SubmittedPhotos verification={verification} />
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
          <SubmittedPhotos verification={verification} />
        </div>
      ) : null}

      {canSubmitNew && !showForm && (
        <button
          type="button"
          onClick={() => {
            // Reset — this section stays mounted across the whole session, so
            // stale state from an earlier form open (e.g. "Passport" selected,
            // which hides the Back Photo field) must not carry over into a
            // fresh submission or resubmission.
            setIdType('national_id')
            setIdNumber('')
            setPhotoFront(null)
            setPhotoBack(null)
            setShowForm(true)
          }}
          className="inline-flex items-center gap-2 border font-medium px-4 py-2 rounded-xl hover:bg-muted transition-colors text-sm"
        >
          <ShieldCheck className="w-4 h-4" /> {verification?.status === 'rejected' ? 'Resubmit ID for Verification' : 'Submit ID for Verification'}
        </button>
      )}

      {canSubmitNew && showForm && (
        <form onSubmit={handleSubmit} className="space-y-4 border-t pt-4">
          {submitVerification.isError && (
            <p className="text-xs text-destructive bg-destructive/10 rounded-lg p-2">
              {submitVerification.error?.response?.data?.message || 'Failed to submit. Please try again.'}
            </p>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium">ID Type</label>
            <select
              value={idType}
              onChange={(e) => { setIdType(e.target.value); setPhotoBack(null) }}
              className="w-full px-3 py-2.5 border rounded-lg text-sm bg-background focus:outline-hidden focus:ring-2 focus:ring-ring"
            >
              {ID_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">ID Number</label>
            <input
              type="text"
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              required
              placeholder="e.g. GAM0123456"
              className="w-full px-3 py-2.5 border rounded-lg text-sm bg-background focus:outline-hidden focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <FilePicker label="Front Photo" file={photoFront} onChange={setPhotoFront} required />
            {needsBack && <FilePicker label="Back Photo" file={photoBack} onChange={setPhotoBack} required />}
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
              disabled={submitVerification.isPending || !photoFront || (needsBack && !photoBack)}
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
