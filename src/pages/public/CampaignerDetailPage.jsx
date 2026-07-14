import { useParams } from '@tanstack/react-router'
import { usePublicCampaigner } from '@/hooks/useUsers'
import { CampaignerProfileView } from '@/features/campaigners/components/CampaignerProfileView'
import { LoadingSpinner } from '@/components/custom/LoadingSpinner'
import { EmptyState } from '@/components/custom/EmptyState'

export function CampaignerDetailPage() {
  const { id } = useParams({ strict: false })
  const { campaigner, isLoading, isError } = usePublicCampaigner(id)

  if (isLoading) return <LoadingSpinner className="py-32" />
  if (isError || !campaigner) {
    return <EmptyState title="Campaigner not found" description="This profile does not exist or has no public campaigns." />
  }

  return <CampaignerProfileView campaigner={campaigner} />
}
