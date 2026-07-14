import { useEffect } from 'react'
import { useParams } from '@tanstack/react-router'
import { useCampaign, useRecordCampaignView } from '@/hooks/useCampaigns'
import { CampaignDetailView } from '@/features/campaigns/components/CampaignDetailView'
import { LoadingSpinner } from '@/components/custom/LoadingSpinner'
import { EmptyState } from '@/components/custom/EmptyState'

export function CampaignDetailPage() {
  const { slug } = useParams({ strict: false })
  const { campaign, isLoading } = useCampaign(slug)
  const recordView = useRecordCampaignView()

  useEffect(() => {
    if (slug) recordView.mutate(slug)
    // Only fire once per slug landed on — not on every campaign refetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug])

  if (isLoading) return <LoadingSpinner className="py-32" />
  if (!campaign) return <EmptyState title="Campaign not found" description="This campaign does not exist or has been removed." />

  return <CampaignDetailView campaign={campaign} />
}
