import { CampaignGrid } from '@/features/campaigns/components/CampaignGrid'
import { usePageMeta } from '@/hooks/usePageMeta'

export function CampaignsPage() {
  usePageMeta({
    title: 'Browse Campaigns',
    description: 'Explore active fundraising campaigns across The Gambia — medical bills, education, community projects, and more.',
  })

  return <CampaignGrid />
}
