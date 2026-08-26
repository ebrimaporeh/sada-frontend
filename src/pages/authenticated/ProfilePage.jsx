import { UserProfile } from '@/features/users/components/UserProfile'
import { PageHeader } from '@/components/custom/PageHeader'
import { LoadingSpinner } from '@/components/custom/LoadingSpinner'
import { EmptyState } from '@/components/custom/EmptyState'
import { OrganizationOverview } from './OrganizationDetail/OrganizationOverview'
import { useActiveProfile } from '@/hooks/useActiveProfile'
import { useOrganization } from '@/hooks/useOrganizations'

// "Profile" follows the active profile switcher, same as Verification --
// an organization has no personal details of its own (name/phone/logo/
// verification instead), so acting as one shows its identity here, not
// the signed-in individual's. useActiveProfile().organization only
// carries the lean per-membership shape (see UserSerializer.get_organizations),
// missing fields OrganizationOverview needs (member_count,
// organization_type_name, created_at) -- fetch the full record via
// useOrganization() instead of reusing that lean one.
function OrganizationProfile({ organizationId }) {
  const { data: organization, isLoading, isError } = useOrganization(organizationId)

  if (isLoading) return <LoadingSpinner className="py-32" />
  if (isError || !organization) {
    return (
      <EmptyState
        title="Organization not found"
        description="This organization doesn't exist or you're not a member of it."
      />
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader title="Organization Profile" description="This is what's shown while acting as this organization." />
      <OrganizationOverview organization={organization} />
    </div>
  )
}

export function ProfilePage() {
  const { isOrg, organization } = useActiveProfile()
  if (isOrg) return <OrganizationProfile organizationId={organization.id} />
  return <UserProfile />
}
