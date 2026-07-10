import { useState } from 'react'
import { Shield, Zap, HeartHandshake, Wallet } from 'lucide-react'

const providers = [
  { name: 'Wave', logo: '/assets/logos/wave-logo.png' },
  { name: 'APS Wallet', logo: '/assets/logos/aps-logo.svg' },
]

function ProviderBadge({ name, logo }) {
  const [logoFailed, setLogoFailed] = useState(false)
  return (
    <div className="inline-flex items-center gap-2 bg-card border border-border/50 px-4 py-2 rounded-full hover:border-primary/50 transition-colors">
      {logoFailed ? (
        <Wallet className="w-4 h-4 text-primary" />
      ) : (
        <img src={logo} alt="" className="h-4 w-auto" onError={() => setLogoFailed(true)} />
      )}
      <span className="font-medium text-sm">{name}</span>
    </div>
  )
}

const benefits = [
  {
    icon: Zap,
    title: 'Instant',
    description: 'Donations arrive in seconds, not days.',
  },
  {
    icon: Shield,
    title: 'Secure',
    description: 'Bank-level encryption protects every transaction.',
  },
  {
    icon: HeartHandshake,
    title: 'Diaspora-friendly',
    description: 'Support from The Gambia and abroad with the same simplicity.',
  },
]

export function MobileMoneySection() {
  return (
    <section className="bg-linear-to-br from-primary/5 via-background to-primary/5 py-24 border-t border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <div className="section-label justify-center">
            <div className="section-label-line" />
            <span className="section-label-text">Mobile Money</span>
            <div className="section-label-line" />
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Donate with one tap
          </h2>
          <p className="text-muted-foreground mt-4 text-lg max-w-2xl mx-auto">
            Send funds instantly using Wave or APS Wallet — from The Gambia or
            anywhere in the diaspora.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5 mb-16">
          {benefits.map(({ icon: Icon, title, description }) => (
            <div key={title} className="bg-card border rounded-2xl p-6 text-center transition-all hover:shadow-brand-md hover:-translate-y-0.5">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">{title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mt-1">{description}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-2 flex-wrap">
          {providers.map((provider) => (
            <ProviderBadge key={provider.name} {...provider} />
          ))}
        </div>
      </div>
    </section>
  )
}
