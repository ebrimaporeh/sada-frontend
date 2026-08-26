import { FundraiserGrid } from '@/features/fundraisers/components/FundraiserGrid'
import { usePageMeta } from '@/hooks/usePageMeta'

export function FundraisersPage() {
  usePageMeta({
    title: 'Fundraisers',
    description: 'Meet the people and organizations raising funds on the platform.',
  })

  return <FundraiserGrid />
}
