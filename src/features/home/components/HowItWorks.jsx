import { useEffect, useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { PenSquare, Share2, Smartphone, ArrowRight } from 'lucide-react'
import { ROUTES } from '@/constants'
import { usePublicStats } from '@/hooks/useCampaigns'
import { compactNumber } from '@/utils/formatters'
import { cn } from '@/utils/cn'
import stepOneImage from '@/assets/start-campaign-step-1.png'
import stepTwoImage from '@/assets/share-on-social-media step-2.jpg'
import stepThreeImage from '@/assets/receive-funds step-3.jpg'

const steps = [
  {
    number: '01',
    icon: PenSquare,
    image: stepOneImage,
    title: 'Create campaign',
    description:
      'Share your story with a compelling title, photo, and fundraising goal. Tell donors exactly why their support matters.',
  },
  {
    number: '02',
    icon: Share2,
    image: stepTwoImage,
    title: 'Share & rally',
    description:
      "Spread the word through WhatsApp, Facebook, and direct links. The more people see it, the faster you'll reach your goal.",
  },
  {
    number: '03',
    icon: Smartphone,
    image: stepThreeImage,
    title: 'Receive funds',
    description:
      'Donations arrive directly to your mobile money account. Withdraw anytime — a small platform fee applies only when you cash out.',
  },
]

export function HowItWorks() {
  const { stats } = usePublicStats()
  const scrollColumnRef = useRef(null)
  const [activeStep, setActiveStep] = useState(0)

  useEffect(() => {
    const stepEls = scrollColumnRef.current?.querySelectorAll('[data-step]')
    if (!stepEls?.length) return

    // Treat the middle band of the viewport as the "reveal line" — whichever
    // step's text block is crossing it becomes the active one, driving the
    // sticky image swap on the left.
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveStep(Number(entry.target.dataset.step))
          }
        })
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
    )

    stepEls.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

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

        <div className="grid lg:grid-cols-2 lg:gap-12 mb-12">
          {/* Sticky image panel — desktop only, swaps per active step */}
          <div className="hidden  lg:block relative">
            <div className="sticky top-24 h-[80vh] rounded-3xl overflow-hidden border bg-muted shadow-brand-md">
              {steps.map((step, i) => (
                <img
                  key={step.number}
                  src={step.image}
                  alt={step.title}
                  className={cn(
                    'absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-out',
                    activeStep === i ? 'opacity-100' : 'opacity-0',
                  )}
                />
              ))}

              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-6 pt-16">
                <span className="font-display text-white/70 text-sm font-semibold tracking-wide">
                  STEP {steps[activeStep].number}
                </span>
                <h3 className="text-white text-2xl font-bold mt-1">{steps[activeStep].title}</h3>
              </div>

              <div className="absolute top-5 right-5 flex gap-1.5">
                {steps.map((_, i) => (
                  <span
                    key={i}
                    className={cn(
                      'h-1.5 rounded-full transition-all duration-500',
                      activeStep === i ? 'w-8 bg-white' : 'w-1.5 bg-white/40',
                    )}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Text column — each step is a full-height scroll-trigger zone on desktop */}
          <div ref={scrollColumnRef}>
            {steps.map(({ number, icon: Icon, image, title, description }, i) => (
              <div
                key={number}
                data-step={i}
                className="min-h-[80vh] lg:min-h-[80vh] flex flex-col justify-center py-10 lg:py-0"
              >
                <div className="lg:hidden mb-6 rounded-2xl overflow-hidden border h-64">
                  <img src={image} alt={title} className="w-full h-full object-cover" />
                </div>

                <span className="font-display text-5xl font-bold text-primary/20 block mb-3">
                  {number}
                </span>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center h-11 w-11 rounded-xl bg-primary/10 flex-shrink-0">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold">{title}</h3>
                </div>
                <p className="text-muted-foreground text-lg leading-relaxed max-w-md">{description}</p>
              </div>
            ))}
          </div>
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
            No donor-side fees — a small platform fee applies only when you withdraw funds.
          </p>
        </div>
      </div>
    </section>
  )
}
