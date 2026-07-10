import { Link } from '@tanstack/react-router'
import { ArrowRight, Heart, MapPin } from 'lucide-react'
import { ROUTES } from '@/constants'
import { CampaignCard } from '@/components/custom/CampaignCard'
import { CampaignCardSkeleton } from '@/components/custom/CampaignCardSkeleton'
import { useFeaturedCampaigns, usePublicStats } from '@/hooks/useCampaigns'
import { formatGMD, compactNumber } from '@/utils/formatters'

export function HeroSection() {
  const { campaigns, isLoading } = useFeaturedCampaigns()
  const { stats } = usePublicStats()
  const heroCard = campaigns[0] ?? null

  const heroStats = [
    { value: stats ? formatGMD(stats.total_raised) : '—', label: 'Raised for causes' },
    { value: stats ? compactNumber(stats.fundraisers_count) : '—', label: 'Fundraisers' },
    { value: stats ? `${stats.success_rate}%` : '—', label: 'Reach their goal' },
  ]

  return (
    <section className="relative overflow-hidden">
      {/* Dot grid backdrop */}
      <div
        className="absolute inset-0 opacity-[0.4] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(hsl(var(--border)) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />
      {/* Soft brand blob */}
      <div
        className="absolute -top-32 -right-32 w-lg h-128 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: 'var(--primary-gradient)' }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Text */}
          <div>
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-semibold px-3 py-1.5 rounded-full mb-5">
              <MapPin className="w-3.5 h-3.5" /> Built for The Gambia
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-5">
              Help your{' '}
              <em className="not-italic text-primary">community</em>{' '}
              thrive
            </h1>

            <p className="text-lg text-muted-foreground leading-[1.8] mb-9 max-w-lg">
              Support real Gambians raising funds for medical emergencies, education, community
              projects, and more — donate with mobile money in seconds, no fee taken off the top.
            </p>

            <div className="flex flex-wrap gap-3 mb-11">
              <Link
                to={ROUTES.CAMPAIGN_NEW}
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity shadow-brand-md"
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

            <div className="stat-grid grid-cols-3">
              {heroStats.map((s) => (
                <div key={s.label}>
                  <strong className="block font-display text-2xl sm:text-3xl font-bold text-foreground leading-none">
                    {s.value}
                  </strong>
                  <span className="block text-muted-foreground text-[11px] mt-1.5 tracking-wide">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Featured campaign card */}
          <div className="relative hidden lg:block">
            <div className="section-label justify-end w-full">
              <span className="section-label-text">Trending Now</span>
              <div className="section-label-line" />
            </div>
            <div className="absolute inset-0 top-9 bg-linear-to-br from-primary/5 to-primary/10 rounded-3xl -rotate-2 scale-105" />
            <div className="relative">
              {isLoading && <CampaignCardSkeleton className="max-w-sm mx-auto shadow-brand-lg" />}
              {!isLoading && heroCard && <CampaignCard campaign={heroCard} className="max-w-sm mx-auto shadow-brand-lg" />}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
