import { useParams, Link } from '@tanstack/react-router'
import { ChevronLeft, Megaphone } from 'lucide-react'
import { usePublicFundraiser } from '@/hooks/useUsers'
import { FundraiserProfileView } from '@/features/fundraisers/components/FundraiserProfileView'
import { CampaignCardSkeleton } from '@/components/custom/CampaignCardSkeleton'
import { EmptyState } from '@/components/custom/EmptyState'
import { ROUTES } from '@/constants'

function FundraiserProfileHeaderSkeleton() {
  return (
    <div className="border rounded-2xl p-6 bg-card flex flex-col sm:flex-row items-center sm:items-start gap-6 animate-pulse">
      <div className="w-24 h-24 rounded-full bg-muted flex-shrink-0" />
      <div className="flex-1 min-w-0 w-full flex flex-col items-center sm:items-start space-y-3">
        <div className="h-5 bg-muted rounded w-40" />
        <div className="h-3.5 bg-muted rounded w-56" />
        <div className="h-3.5 bg-muted rounded w-full max-w-md" />
        <div className="flex items-center justify-center sm:justify-start gap-6 w-full pt-4 border-t">
          <div className="space-y-1.5">
            <div className="h-5 bg-muted rounded w-10" />
            <div className="h-2.5 bg-muted rounded w-16" />
          </div>
          <div className="space-y-1.5">
            <div className="h-5 bg-muted rounded w-14" />
            <div className="h-2.5 bg-muted rounded w-20" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function FundraiserDetailPage() {
  const { id } = useParams({ strict: false })
  const { fundraiser, isLoading, isError } = usePublicFundraiser(id)

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        <Link to={ROUTES.FUNDRAISERS} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="w-4 h-4" />
          All Fundraisers
        </Link>

        <FundraiserProfileHeaderSkeleton />

        <div>
          <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
            <Megaphone className="w-4 h-4" /> Campaigns
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <CampaignCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (isError || !fundraiser) {
    return <EmptyState title="Fundraiser not found" description="This profile does not exist or has no public campaigns." />
  }

  return <FundraiserProfileView fundraiser={fundraiser} />
}
