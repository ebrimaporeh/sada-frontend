import { Link } from '@tanstack/react-router'
import { ROUTES } from '@/constants'

const sections = [
  {
    title: '1. Acceptance',
    body: 'By using GambiaFund you agree to these Terms of Service. If you do not agree, please do not use the platform. We may update these terms from time to time and will notify users of material changes.',
  },
  {
    title: '2. Eligibility',
    body: 'You must be at least 18 years old to create a campaign or make a donation. By registering, you confirm that you are 18 or older and that the information you provide is accurate.',
  },
  {
    title: '3. Campaign Rules',
    body: 'Campaign owners are responsible for the accuracy of all information provided. Campaigns must have a genuine, lawful purpose. The following are prohibited: false or misleading campaigns, campaigns that promote violence, illegal activity, or discrimination, and campaigns where the stated beneficiary has not consented. GambiaFund reserves the right to suspend or remove any campaign that violates these rules.',
  },
  {
    title: '4. Fees',
    body: 'GambiaFund charges no platform fee. A 1.5% transaction fee is deducted from each donation by ModemPay to cover mobile money processing costs. Fees are clearly disclosed before each donation is confirmed.',
  },
  {
    title: '5. Withdrawals',
    body: 'Campaign owners may withdraw funds at any time subject to identity verification. GambiaFund reserves the right to hold funds pending investigation if fraud is suspected. Funds held as part of an active investigation may not be released until the investigation is resolved.',
  },
  {
    title: '6. Donor Obligations',
    body: 'Donations are voluntary and generally non-refundable once processed. If you believe a donation was made in error or to a fraudulent campaign, contact support@gambiafund.gm within 48 hours and we will investigate.',
  },
  {
    title: '7. Intellectual Property',
    body: 'You retain ownership of content you upload (photos, campaign stories). By uploading content, you grant GambiaFund a non-exclusive licence to display that content on the platform for the purpose of operating the service.',
  },
  {
    title: '8. Limitation of Liability',
    body: 'GambiaFund is a platform that facilitates fundraising. We do not guarantee that campaign goals will be reached or that funds will be used as stated by campaign owners. We are not liable for losses arising from fraudulent campaigns beyond the funds held in our systems at the time a complaint is raised.',
  },
  {
    title: '9. Governing Law',
    body: 'These terms are governed by the laws of The Gambia. Any disputes shall be resolved in the courts of The Gambia.',
  },
  {
    title: '10. Contact',
    body: 'For questions about these terms, email legal@gambiafund.gm. Last updated: June 2026.',
  },
]

export function TermsPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold mb-2">Terms of Service</h1>
        <p className="text-muted-foreground">Please read these terms carefully before using GambiaFund.</p>
      </div>

      <div className="space-y-7">
        {sections.map(({ title, body }) => (
          <div key={title}>
            <h2 className="font-semibold mb-2">{title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 flex flex-wrap gap-4 text-sm text-muted-foreground justify-center">
        <Link to={ROUTES.HELP} className="hover:text-foreground transition-colors">Help Center</Link>
        <Link to={ROUTES.TRUST_SAFETY} className="hover:text-foreground transition-colors">Trust &amp; Safety</Link>
        <Link to={ROUTES.PRIVACY} className="hover:text-foreground transition-colors">Privacy Policy</Link>
      </div>
    </div>
  )
}
