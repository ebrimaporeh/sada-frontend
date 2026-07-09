import { useState } from 'react'
import { ShieldCheck, Upload, AlertCircle, Clock, CheckCircle2, XCircle } from 'lucide-react'
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
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}{required && <span className="text-destructive"> *</span>}</label>
      <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed rounded-lg hover:border-primary/50 cursor-pointer transition-colors text-sm">
        <Upload className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <span className="text-muted-foreground truncate">{file ? file.name : 'Click to upload photo'}</span>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onChange(e.target.files?.[0] || null)}
        />
      </label>
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
  const badge = verification ? STATUS_BADGE[verification.status] : null

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
        <p className="text-xs text-muted-foreground">
          Your identity was verified{verification?.reviewed_at ? ` on ${formatDate(verification.reviewed_at)}` : ''}.
        </p>
      ) : verification && verification.status === 'pending' ? (
        <div className="text-xs text-muted-foreground border rounded-lg p-3 bg-muted/30 space-y-1">
          <p>Submitted {formatDate(verification.created_at)} — {ID_TYPES.find((t) => t.value === verification.id_type)?.label}.</p>
          <p>We'll email you once it's been reviewed.</p>
        </div>
      ) : verification && verification.status === 'rejected' && !showForm ? (
        <div className="text-xs space-y-2">
          <div className="border border-red-200 bg-red-50 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-red-800 font-medium">Your last submission wasn't approved.</p>
              {verification.rejection_reason && <p className="text-red-700 mt-0.5">{verification.rejection_reason}</p>}
            </div>
          </div>
        </div>
      ) : null}

      {canSubmitNew && !showForm && (
        <button
          type="button"
          onClick={() => setShowForm(true)}
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
              className="w-full px-3 py-2.5 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
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
              className="w-full px-3 py-2.5 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
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
