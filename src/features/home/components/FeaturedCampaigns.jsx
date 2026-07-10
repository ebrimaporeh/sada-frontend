import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { useFeaturedCampaigns } from '@/hooks/useCampaigns'
import { CampaignCard } from '@/components/custom/CampaignCard'
import { CampaignCardSkeleton } from '@/components/custom/CampaignCardSkeleton'
import { ROUTES } from '@/constants'

export function FeaturedCampaigns() {
  const { campaigns, isLoading } = useFeaturedCampaigns()

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="section-label">
            <div className="section-label-line" />
            <span className="section-label-text">Featured</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold">Trending Campaigns</h2>
          <p className="text-muted-foreground text-sm mt-1">Most supported campaigns right now</p>
        </div>
        <Link
          to={ROUTES.CAMPAIGNS}
          className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          View all <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <CampaignCardSkeleton key={i} />)
          : campaigns.map((c) => <CampaignCard key={c.id} campaign={c} />)}
      </div>

      <div className="text-center mt-6 sm:hidden">
        <Link to={ROUTES.CAMPAIGNS} className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1">
          View all campaigns <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  )
}
