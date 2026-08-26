import { PageHeader } from '@/components/custom/PageHeader'
import { IdentityVerificationSection } from '@/features/users/components/IdentityVerificationSection'
import { OrganizationVerificationSection } from '@/features/users/components/OrganizationVerificationSection'
import { useActiveProfile } from '@/hooks/useActiveProfile'

// Which verification this page shows follows the active profile switcher
// -- identity verification is always about the signed-in person, so it
// renders when acting as yourself; organization verification is scoped to
// one specific org (it has to be, a person can belong to several), so it
// renders for whichever org is currently active. There's no third
// "personal identity while acting as an org" case exposed here -- switch
// back to your personal profile for that.
export function VerificationPage() {
  const { isOrg, organization } = useActiveProfile()

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title={isOrg ? 'Organization Verification' : 'Identity Verification'}
        description={
          isOrg
            ? `Verified organizations build more trust with donors.`
            : 'Verified campaign owners build more trust with donors.'
        }
      />
      {isOrg ? <OrganizationVerificationSection organization={organization} /> : <IdentityVerificationSection />}
    </div>
  )
}
