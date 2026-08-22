import { ZakatCalculator } from '@/features/zakat/components/ZakatCalculator'
import { usePageMeta } from '@/hooks/usePageMeta'

export function ZakatPage() {
  usePageMeta({
    title: 'Zakat Calculator',
    description: 'Calculate your Zakat and give it to eligible campaigns on the platform.',
  })

  return <ZakatCalculator />
}
