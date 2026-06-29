import { Smartphone, Shield, Zap, HeartHandshake } from 'lucide-react'

const providers = [
  { name: 'ModemPay', icon: '💳' },
  { name: 'Wave', icon: '🌊' },
  { name: 'Orange Money', icon: '🟠' },
  { name: 'Afrimoney', icon: '💰' },
]

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
    <section className="bg-gradient-to-br from-primary/5 via-background to-primary/5 py-24 border-t border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-semibold px-3 py-1.5 rounded-full mb-4">
            <Smartphone className="w-3.5 h-3.5" /> Mobile Money
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]">
            Donate with one tap
          </h2>
          <p className="text-muted-foreground mt-4 text-lg max-w-2xl mx-auto">
            Send funds instantly using ModemPay, Wave, Orange Money, or Afrimoney — from The Gambia or
            anywhere in the diaspora.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {benefits.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">{title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-2 flex-wrap">
          {providers.map(({ name, icon }) => (
            <div
              key={name}
              className="inline-flex items-center gap-2 bg-card border border-border/50 px-4 py-2 rounded-full hover:border-primary/50 transition-colors"
            >
              <span className="text-lg">{icon}</span>
              <span className="font-medium text-sm">{name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
