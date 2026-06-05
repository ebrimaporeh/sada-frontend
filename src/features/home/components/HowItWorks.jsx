import { Link } from '@tanstack/react-router'
import { PenSquare, Share2, Smartphone, ArrowRight } from 'lucide-react'
import { ROUTES } from '@/constants'

const steps = [
  {
    number: '01',
    icon: PenSquare,
    title: 'Create your campaign',
    description: 'Tell your story, set a fundraising goal, and explain how the money will be used. Takes less than 10 minutes.',
    color: 'text-primary bg-primary/10',
  },
  {
    number: '02',
    icon: Share2,
    title: 'Share with your network',
    description: 'Share your campaign link on WhatsApp, Facebook, and with family and friends in The Gambia and abroad.',
    color: 'text-blue-600 bg-blue-100',
  },
  {
    number: '03',
    icon: Smartphone,
    title: 'Receive mobile money',
    description: 'Donors pay instantly using ModemPay, Wave, Orange Money, or Afrimoney. No bank account needed.',
    color: 'text-donate bg-donate-light',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-muted/40 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold">How GambiaFund Works</h2>
          <p className="text-muted-foreground mt-2 max-w-xl mx-auto text-sm sm:text-base">
            Raise money for anything that matters — in 3 simple steps, designed for The Gambia.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-10 left-1/3 right-1/3 h-px bg-border" />

          {steps.map(({ number, icon: Icon, title, description, color }, i) => (
            <div key={number} className="relative text-center space-y-4">
              <div className="flex justify-center">
                <div className={`relative w-20 h-20 rounded-2xl flex items-center justify-center ${color}`}>
                  <Icon className="w-8 h-8" />
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-foreground text-background text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
              </div>
              <h3 className="text-lg font-bold">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            to={ROUTES.CAMPAIGN_NEW}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-8 py-3.5 rounded-xl hover:bg-primary/90 transition-colors shadow-md shadow-primary/20"
          >
            Start Your Campaign Free
            <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="text-xs text-muted-foreground mt-3">No platform fee. 100% of donations go to your campaign.</p>
        </div>
      </div>
    </section>
  )
}
