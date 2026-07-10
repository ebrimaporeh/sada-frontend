import { ShieldCheck, Search, Lock, AlertTriangle, Phone } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { ROUTES } from '@/constants'

const sections = [
  {
    icon: Search,
    title: 'Campaign Review',
    body: 'Every campaign submitted to GambiaFund is reviewed by our moderation team. We verify that the campaign story is genuine, the beneficiary information is plausible, and the fundraising goal is appropriate. Campaigns that do not meet our standards are suspended with a reason provided to the organiser.',
  },
  {
    icon: Lock,
    title: 'Secure Payments',
    body: 'All donations are processed through ModemPay, a licensed mobile money gateway covering Wave and APS Wallet. GambiaFund never stores your payment credentials. Payment confirmations happen directly between your mobile network and ModemPay — we only record the result.',
  },
  {
    icon: ShieldCheck,
    title: 'Donor Protection',
    body: 'We display the full fundraising history and withdrawal records for every campaign so donors can see exactly how money is being used. Campaign owners can verify their identity with a government ID for an added trust badge.',
  },
  {
    icon: AlertTriangle,
    title: 'Reporting Abuse',
    body: 'If you believe a campaign is fraudulent or violates our policies, use the Report button on the campaign page. Our team reviews every report and will suspend any campaign found to be in violation.',
  },
  {
    icon: Phone,
    title: 'Contact Our Trust Team',
    body: 'For urgent concerns, reach us through the Help Center below. We aim to respond to trust and safety reports promptly.',
  },
]

export function TrustSafetyPage() {
  return (
    <div>
      <div className="page-header">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <div className="section-label justify-center">
            <div className="section-label-line" />
            <span className="section-label-text">Trust &amp; Safety</span>
            <div className="section-label-line" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">How we protect donors</h1>
          <p className="text-muted-foreground">Every campaign is reviewed, every transaction is traceable, and every report is investigated.</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-14">
        <div className="space-y-4">
          {sections.map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex gap-4 bg-card border rounded-2xl p-5">
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
    </div>
  )
}
