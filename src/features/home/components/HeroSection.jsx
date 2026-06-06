import { Link } from '@tanstack/react-router'
import { ArrowRight, Heart, Shield, Zap, MapPin, Flame } from 'lucide-react'
import { ROUTES } from '@/constants'
import { CampaignCard } from '@/components/custom/CampaignCard'
import { CampaignCardSkeleton } from '@/components/custom/CampaignCardSkeleton'
import { useFeaturedCampaigns } from '@/hooks/useCampaigns'

const trust = [
  { icon: Shield, label: 'Verified campaigns' },
  { icon: Zap, label: 'Instant mobile money' },
  { icon: Heart, label: 'Zero platform fee' },
]

export function HeroSection() {
  const { campaigns, isLoading } = useFeaturedCampaigns()
  const heroCard = campaigns[0] ?? null

  return (
    <section className="bg-gradient-to-br from-green-50 via-background to-emerald-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-14 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-semibold px-3 py-1.5 rounded-full">
              <MapPin className="w-3.5 h-3.5" /> Built for The Gambia
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]">
              Help Your{' '}
              <span className="text-primary">Community</span>{' '}
              Thrive
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
              Support real Gambians raising funds for medical emergencies, education, community projects, and more. Donate with mobile money in seconds.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                to={ROUTES.CAMPAIGN_NEW}
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors shadow-md shadow-primary/20"
              >
                <Heart className="w-4 h-4 fill-primary-foreground" />
                Start a Campaign
              </Link>
              <Link
                to={ROUTES.CAMPAIGNS}
                className="inline-flex items-center gap-2 border font-semibold px-6 py-3 rounded-xl hover:bg-accent transition-colors"
              >
                Browse Campaigns
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Trust signals */}
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {trust.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Icon className="w-4 h-4 text-primary" />
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* Right: Featured campaign card */}
          <div className="relative hidden lg:block">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 rounded-3xl -rotate-2 scale-105" />
            <div className="relative">
              <div className="absolute -top-3 -right-3 bg-donate text-donate-foreground text-xs font-bold px-3 py-1.5 rounded-full shadow-lg z-10 flex items-center gap-1">
                <Flame className="w-3 h-3" /> Trending Now
              </div>
              {isLoading && <CampaignCardSkeleton className="max-w-sm mx-auto shadow-xl" />}
              {!isLoading && heroCard && <CampaignCard campaign={heroCard} className="max-w-sm mx-auto shadow-xl" />}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
