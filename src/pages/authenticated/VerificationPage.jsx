import { PageHeader } from '@/components/custom/PageHeader'
import { IdentityVerificationSection } from '@/features/users/components/IdentityVerificationSection'
import { OrganizationVerificationSection } from '@/features/users/components/OrganizationVerificationSection'
import { useMe } from '@/hooks/useAuth'
import { ACCOUNT_TYPES } from '@/constants'

export function VerificationPage() {
  const { data: me } = useMe()
  const isOrg = me?.account_type === ACCOUNT_TYPES.ORGANIZATION

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title={isOrg ? 'Organization Verification' : 'Identity Verification'}
        description={
          isOrg
            ? 'Verified organizations build more trust with donors.'
            : 'Verified campaign owners build more trust with donors.'
        }
      />
      {isOrg ? <OrganizationVerificationSection /> : <IdentityVerificationSection />}
    </div>
  )
}
