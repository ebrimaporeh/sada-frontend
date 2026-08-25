import { Link } from '@tanstack/react-router'
import { ArrowRight, Loader2 } from 'lucide-react'
import { SectionCard } from '../AdminCampaignDetail/shared'
import { VERIFICATION_STATUS_BADGE } from '../shared/verificationDisplay'
import { useOrganizationVerificationHistory } from '@/hooks/useUsers'
import { cn } from '@/utils/cn'

function InfoField({ label, value }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
      <p className="text-sm font-medium">{value || '—'}</p>
    </div>
  )
}

export function VerificationTab({ organization }) {
  const { data: verification, isLoading } = useOrganizationVerificationHistory(organization.id)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <SectionCard
      title="Organization Verification"
      action={
        <Link to="/admin/verifications" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
          Verifications queue <ArrowRight className="w-3 h-3" />
        </Link>
      }
    >
      {verification ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Registration Proof</p>
            <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full', VERIFICATION_STATUS_BADGE[verification.status]?.className)}>
              {VERIFICATION_STATUS_BADGE[verification.status]?.label || verification.status}
            </span>
          </div>
          <InfoField label="Registration Number" value={verification.registration_number} />
          {verification.status === 'rejected' && verification.rejection_reason && (
            <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg p-2.5">
              {verification.rejection_reason}
            </p>
          )}
          {(verification.registration_document || verification.organization_photo) && (
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Registration Certificate', url: verification.registration_document },
                { label: 'Organization Photo', url: verification.organization_photo },
              ].filter((d) => d.url).map((d) => (
                <a key={d.label} href={d.url} target="_blank" rel="noreferrer" className="block group">
                  <div className="rounded-lg overflow-hidden border aspect-video bg-muted">
                    <img src={d.url} alt={d.label} className="w-full h-full object-cover group-hover:opacity-80 transition-opacity" />
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No organization documents have been submitted for review yet.</p>
      )}
    </SectionCard>
  )
}
