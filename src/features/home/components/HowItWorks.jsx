import { Link } from '@tanstack/react-router'
import { PenSquare, Share2, Smartphone, ArrowRight } from 'lucide-react'
import { ROUTES } from '@/constants'
import { usePublicStats } from '@/hooks/useCampaigns'
import { compactNumber } from '@/utils/formatters'

const steps = [
  {
    number: '01',
    icon: PenSquare,
    title: 'Create campaign',
    description:
      'Share your story with a compelling title, photo, and fundraising goal. Tell donors exactly why their support matters.',
  },
  {
    number: '02',
    icon: Share2,
    title: 'Share & rally',
    description:
      "Spread the word through WhatsApp, Facebook, and direct links. The more people see it, the faster you'll reach your goal.",
  },
  {
    number: '03',
    icon: Smartphone,
    title: 'Receive funds',
    description:
      'Donations arrive directly to your mobile money account. Withdraw anytime — a small platform fee applies only when you cash out.',
  },
]

export function HowItWorks() {
  const { stats } = usePublicStats()

  return (
    <section id="how-it-works" className="bg-background py-20 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <div className="section-label justify-center">
            <div className="section-label-line" />
            <span className="section-label-text">Getting Started</span>
            <div className="section-label-line" />
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Three steps to success
          </h2>
          <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto leading-relaxed">
            Creating and managing a campaign takes just minutes. We handle the payments, you focus on
            your cause.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5 mb-12">
          {steps.map(({ number, icon: Icon, title, description }) => (
            <div key={number} className="bg-card border rounded-2xl p-6 transition-all hover:shadow-brand-md hover:-translate-y-0.5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center justify-center h-11 w-11 rounded-xl bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <span className="font-display text-3xl font-bold text-primary/20">{number}</span>
              </div>
              <h3 className="text-lg font-bold mb-2">{title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
            </div>
          ))}
        </div>

        <div className="text-center pt-8 border-t">
          <Link
            to={ROUTES.CAMPAIGN_NEW}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-8 py-3.5 rounded-xl hover:opacity-90 transition-opacity shadow-brand-md"
          >
            Create Your Campaign
            <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="text-xs text-muted-foreground mt-4">
            {stats ? `Trusted by ${compactNumber(stats.fundraisers_count)} fundraisers. ` : ''}
            No donor-side fees. 100% of what's donated reaches your cause.
          </p>
        </div>
      </div>
    </section>
  )
}
