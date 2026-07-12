import { Link } from '@tanstack/react-router'
import { HeartHandshake, ShieldCheck, Smartphone, Users, ArrowRight, Target, Sparkles } from 'lucide-react'
import { usePublicStats } from '@/hooks/useCampaigns'
import { StatsGrid } from '@/components/custom/StatsGrid'
import { formatGMD, compactNumber } from '@/utils/formatters'
import { settings } from '@/settings'
import { ROUTES } from '@/constants'

const pillars = [
  {
    icon: Smartphone,
    title: 'Built for how Gambians actually pay',
    body: "No bank account required. Donate or withdraw straight through Wave or APS Wallet — the mobile money networks people here already use every day.",
  },
  {
    icon: HeartHandshake,
    title: 'No fee on the way in',
    body: 'Every donation goes to the campaign in full — donors only ever pay whatever their mobile money provider itself charges. GambiaFund only takes a small fee when a campaign owner withdraws.',
  },
  {
    icon: ShieldCheck,
    title: 'Real people, reviewed',
    body: 'Campaign owners can verify their identity with a government ID, and every campaign shows its real donation and withdrawal history — nothing hidden.',
  },
  {
    icon: Users,
    title: 'For the diaspora too',
    body: "Family and friends abroad can support a campaign back home in seconds, from anywhere in the world.",
  },
]

export function AboutPage() {
  const { stats } = usePublicStats()

  return (
    <div>
      {/* Hero */}
      <section className="bg-linear-to-b from-primary/5 to-background border-b py-20 sm:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]">
            Crowdfunding, built for The Gambia
          </h1>
          <p className="text-lg text-muted-foreground mt-6 leading-relaxed">
            {settings.siteName} exists so that medical bills, school fees, community projects, and
            emergencies don't have to depend on who you happen to know. We connect Gambians who need
            help with the people — at home and in the diaspora — who want to give it, using the
            mobile money networks everyone already trusts.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 grid sm:grid-cols-[auto_1fr] gap-6 items-start">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Target className="w-6 h-6 text-primary" />
          </div>
          <div>
            <div className="section-label">
              <div className="section-label-line" />
              <span className="section-label-text">Our Mission</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">
              Fundraising shouldn't depend on who you know
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Make it possible for any Gambian to raise money for a genuine cause in minutes, without
              needing a bank account, a foreign platform, or a middleman — and make sure every donor
              can see exactly where their money went.
            </p>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="py-16 sm:py-20 bg-muted/30 border-y">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <div className="section-label justify-center">
              <div className="section-label-line" />
              <span className="section-label-text">Why GambiaFund</span>
              <div className="section-label-line" />
            </div>
            <h2 className="text-3xl font-bold">What makes us different</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {pillars.map(({ icon: Icon, title, body }) => (
              <div key={title} className="flex gap-4 bg-card border rounded-2xl p-6 transition-all hover:shadow-brand-md hover:-translate-y-0.5">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1.5">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      {stats && (
        <section className="py-16 sm:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <StatsGrid
              items={[
                { label: 'Raised so far', value: formatGMD(stats.total_raised) },
                { label: 'Fundraisers', value: compactNumber(stats.fundraisers_count) },
                { label: 'Donors', value: compactNumber(stats.donors_count) },
                { label: 'Reach their goal', value: `${stats.success_rate}%` },
              ]}
            />
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 sm:py-20 border-t">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold mb-3">Have a cause worth rallying behind?</h2>
          <p className="text-muted-foreground mb-8">
            Starting a campaign takes a few minutes, and it's live immediately — no waiting on approval.
          </p>
          <Link
            to={ROUTES.CAMPAIGN_NEW}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-8 py-3.5 rounded-xl hover:opacity-90 transition-opacity shadow-brand-md"
          >
            Start Your Campaign
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}
