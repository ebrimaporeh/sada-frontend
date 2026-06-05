import { useParams } from '@tanstack/react-router'
import { useCampaign } from '@/hooks/useCampaigns'
import { DonateCheckout } from '@/features/donations/components/DonateCheckout'
import { LoadingSpinner } from '@/components/custom/LoadingSpinner'
import { EmptyState } from '@/components/custom/EmptyState'

export function DonatePage() {
  const { slug } = useParams({ strict: false })
  const { campaign, isLoading } = useCampaign(slug)

  if (isLoading) return <LoadingSpinner className="py-32" />
  if (!campaign) return <EmptyState title="Campaign not found" description="This campaign does not exist or has been removed." />

  return <DonateCheckout campaign={campaign} />
}
