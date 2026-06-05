import { ShieldCheck, Search, Lock, AlertTriangle, Phone } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { ROUTES } from '@/constants'

const sections = [
  {
    icon: Search,
    title: 'Campaign Review',
    body: 'Every campaign submitted to GambiaFund is reviewed by our moderation team before going live. We verify that the campaign story is genuine, the beneficiary information is plausible, and the fundraising goal is appropriate. Campaigns that do not meet our standards are rejected with a reason provided to the organiser.',
  },
  {
    icon: Lock,
    title: 'Secure Payments',
    body: 'All donations are processed through ModemPay, a licensed mobile money platform. GambiaFund never stores your payment credentials. Payment confirmations happen directly between your mobile network and ModemPay — we only record the result.',
  },
  {
    icon: ShieldCheck,
    title: 'Donor Protection',
    body: 'We display the full fundraising history and withdrawal records for every campaign so donors can see exactly how money is being used. Campaign owners must verify their identity before withdrawing funds above a set threshold.',
  },
  {
    icon: AlertTriangle,
    title: 'Reporting Abuse',
    body: 'If you believe a campaign is fraudulent or violates our policies, use the Report button on the campaign page or email us at trust@gambiafund.gm. We investigate all reports within 48 hours and will suspend any campaign found to be in violation.',
  },
  {
    icon: Phone,
    title: 'Contact Our Trust Team',
    body: 'For urgent concerns, reach the Trust & Safety team directly at trust@gambiafund.gm or call +220 000 0000 during business hours (Monday–Friday, 9 am–5 pm GMT).',
  },
]

export function TrustSafetyPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold mb-2">Trust &amp; Safety</h1>
        <p className="text-muted-foreground">How we protect donors and ensure campaigns are genuine.</p>
      </div>

      <div className="space-y-8">
        {sections.map(({ icon: Icon, title, body }) => (
          <div key={title} className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold mb-1">{title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 flex flex-wrap gap-4 text-sm text-muted-foreground justify-center">
        <Link to={ROUTES.HELP} className="hover:text-foreground transition-colors">Help Center</Link>
        <Link to={ROUTES.PRIVACY} className="hover:text-foreground transition-colors">Privacy Policy</Link>
        <Link to={ROUTES.TERMS} className="hover:text-foreground transition-colors">Terms of Service</Link>
      </div>
    </div>
  )
}
