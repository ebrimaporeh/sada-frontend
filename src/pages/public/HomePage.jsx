import { HeroSection } from '@/features/home/components/HeroSection'
import { StatsSection } from '@/features/home/components/StatsSection'
import { FeaturedCampaigns } from '@/features/home/components/FeaturedCampaigns'
import { CategoriesSection } from '@/features/home/components/CategoriesSection'
import { HowItWorks } from '@/features/home/components/HowItWorks'
import { PaymentMethodsSection } from '@/features/home/components/PaymentMethodsSection'
import { usePageMeta } from '@/hooks/usePageMeta'

export function HomePage() {
  usePageMeta({ url: window.location.origin + '/' })

  return (
    <>
      <HeroSection />
      <StatsSection />
      <FeaturedCampaigns />
      <CategoriesSection />
      <HowItWorks />
      <PaymentMethodsSection />
    </>
  )
}
