import { PageHeader } from '@/components/custom/PageHeader'
import { IdentityVerificationSection } from '@/features/users/components/IdentityVerificationSection'

export function VerificationPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title="Identity Verification"
        description="Verified campaign owners build more trust with donors."
      />
      <IdentityVerificationSection />
    </div>
  )
}
