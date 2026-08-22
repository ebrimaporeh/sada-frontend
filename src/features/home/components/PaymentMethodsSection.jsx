import { useState } from 'react'
import { Shield, Zap, HeartHandshake, Wallet } from 'lucide-react'
import { useDonationMethods } from '@/hooks/usePayments'
import { cn } from '@/utils/cn'

const benefits = [
  {
    icon: Zap,
    title: 'Instant',
    description: 'Funds arrive in seconds, not days.',
  },
  {
    icon: Shield,
    title: 'Secure',
    description: 'Bank-level encryption protects every transaction.',
  },
  {
    icon: HeartHandshake,
    title: 'Diaspora-friendly',
    description: 'Give from The Gambia or abroad with the same simplicity.',
  },
]

function MethodCard({ name, description, logo, color, short }) {
  const [logoFailed, setLogoFailed] = useState(false)
  const showImage = Boolean(logo) && !logoFailed
  return (
    <div className="flex items-center gap-3 bg-card border rounded-2xl p-4 hover:border-primary/40 hover:shadow-sm transition-all">
      <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden', !showImage && color)}>
        {showImage ? (
          <img src={logo} alt="" className="w-full h-full object-contain p-1.5" onError={() => setLogoFailed(true)} />
        ) : (
          <span className="text-white font-bold text-sm">{short || <Wallet className="w-5 h-5" />}</span>
        )}
      </div>
      <div className="min-w-0">
        <p className="font-semibold text-sm">{name}</p>
        <p className="text-xs text-muted-foreground truncate">{description}</p>
      </div>
    </div>
  )
}

function MethodCardSkeleton() {
  return (
    <div className="flex items-center gap-3 bg-card border rounded-2xl p-4 animate-pulse">
      <div className="w-11 h-11 rounded-xl bg-muted flex-shrink-0" />
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="h-3 bg-muted rounded w-2/3" />
        <div className="h-2.5 bg-muted rounded w-4/5" />
      </div>
    </div>
  )
}

export function PaymentMethodsSection() {
  const { methods, isLoading } = useDonationMethods()

  return (
    <section className="bg-linear-to-br from-primary/5 via-background to-primary/5 py-24 border-t border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          {/* Left: headline + benefits */}
          <div>
            <div className="section-label">
              <div className="section-label-line" />
              <span className="section-label-text">Payment</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              Give however works for you
            </h2>
            <p className="text-muted-foreground mt-4 text-lg max-w-lg">
              Mobile money or card — pick what's already in your pocket, whether you're
              in The Gambia or supporting from the diaspora.
            </p>

            <div className="mt-10 space-y-5">
              {benefits.map(({ icon: Icon, title, description }) => (
                <div key={title} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-8 text-xs text-muted-foreground flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" /> Every payment is processed securely by Stripe &amp; ModemPay.
            </p>
          </div>

          {/* Right: active payment methods */}
          <div className="grid sm:grid-cols-2 gap-3">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => <MethodCardSkeleton key={i} />)
            ) : (
              methods.map((method) => <MethodCard key={method.id} {...method} />)
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
