import { useParams } from '@tanstack/react-router'
import { usePublicOrganization } from '@/hooks/useOrganizations'
import { OrganizationDonateCheckout } from '@/features/donations/components/OrganizationDonateCheckout'
import { LoadingSpinner } from '@/components/custom/LoadingSpinner'
import { EmptyState } from '@/components/custom/EmptyState'

// Backs /give/$slug -- the organization's permanent, campaign-independent
// donation destination. Mirrors DonatePage's shape (fetch by slug, hand off
// to a checkout component) but for an Organization instead of a Campaign.
export function OrganizationDonatePage() {
  const { slug } = useParams({ strict: false })
  const { data: organization, isLoading } = usePublicOrganization(slug)

  if (isLoading) return <LoadingSpinner className="py-32" />
  if (!organization) return <EmptyState title="Organization not found" description="This organization doesn't exist." />

  return <OrganizationDonateCheckout organization={organization} />
}
