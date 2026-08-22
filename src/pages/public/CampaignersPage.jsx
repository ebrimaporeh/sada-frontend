import { CampaignerGrid } from '@/features/campaigners/components/CampaignerGrid'
import { usePageMeta } from '@/hooks/usePageMeta'

export function CampaignersPage() {
  usePageMeta({
    title: 'Campaigners',
    description: 'Meet the people and organizations raising funds on the platform.',
  })

  return <CampaignerGrid />
}
