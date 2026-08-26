import { Image as ImageIcon } from 'lucide-react'

// Shared by the individual-user and organization admin detail pages'
// Verification sections/tabs -- same submitted-ID/document display, just
// fed IdentityVerification vs OrganizationVerification data.
export const ID_TYPE_LABELS = {
  national_id: 'National ID Card',
  passport: 'Passport',
  drivers_license: "Driver's License",
}

export const VERIFICATION_STATUS_BADGE = {
  pending: { label: 'Pending Review', className: 'bg-amber-100 text-amber-700' },
  approved: { label: 'Approved', className: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rejected', className: 'bg-red-100 text-red-700' },
}

export function IdPhotos({ front, back }) {
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
