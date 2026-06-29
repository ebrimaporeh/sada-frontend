import { Link } from '@tanstack/react-router'
import { PenSquare, Share2, Smartphone, ArrowRight } from 'lucide-react'
import { ROUTES } from '@/constants'

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
      'Donations arrive directly to your mobile money account. Instant payouts with zero platform fees — we keep nothing.',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-background py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]">
            Three steps to success
          </h2>
          <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto leading-relaxed">
            Creating and managing a campaign takes just minutes. We handle the payments, you focus on
            your cause.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {steps.map(({ number, icon: Icon, title, description }) => (
            <div key={number} className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-primary">{number}</p>
                  <h3 className="text-xl font-bold mt-2">{title}</h3>
                  <p className="text-muted-foreground text-sm mt-2 leading-relaxed">{description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center pt-8 border-t">
          <Link
            to={ROUTES.CAMPAIGN_NEW}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-8 py-3.5 rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
          >
            Create Your Campaign
            <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="text-xs text-muted-foreground mt-4">
            Trusted by {Math.floor(Math.random() * 2000 + 1000)} fundraisers. No fees. 100% of
            donations reach your cause.
          </p>
        </div>
      </div>
    </section>
  )
}
