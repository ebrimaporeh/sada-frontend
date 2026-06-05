import { HeroSection } from '@/features/home/components/HeroSection'
import { StatsSection } from '@/features/home/components/StatsSection'
import { FeaturedCampaigns } from '@/features/home/components/FeaturedCampaigns'
import { CategoriesSection } from '@/features/home/components/CategoriesSection'
import { HowItWorks } from '@/features/home/components/HowItWorks'
import { MobileMoneySection } from '@/features/home/components/MobileMoneySection'

export function HomePage() {
  return (
    <>
      <HeroSection />
      <StatsSection />
      <FeaturedCampaigns />
      <CategoriesSection />
      <HowItWorks />
      <MobileMoneySection />
    </>
  )
}
