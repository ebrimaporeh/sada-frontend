import { Link } from '@tanstack/react-router'
import { ROUTES } from '@/constants'

const sections = [
  {
    title: 'What We Collect',
    body: [
      'Account information — name, email address, phone number, and profile photo when you register.',
      'Campaign information — title, story, images, beneficiary details, and fundraising goal that you provide when creating a campaign.',
      'Donation records — amount, payment provider, timestamp, and optional message for each donation made through the platform.',
      'Usage data — pages visited, device type, and browser to help us improve the platform. We do not use third-party advertising trackers.',
    ],
  },
  {
    title: 'How We Use It',
    body: [
      'To operate your account and process donations.',
      'To review and moderate campaigns submitted to the platform.',
      'To send you notifications about your campaigns, donations, and withdrawals.',
      'To detect and prevent fraud and abuse.',
      'We do not sell your personal data to third parties.',
    ],
  },
  {
    title: 'Who We Share It With',
    body: [
      'ModemPay — your mobile number and donation amount are shared to process payments.',
      'Our moderation team — campaign details are reviewed internally before going live.',
      'Law enforcement — only when required by law or to protect users from harm.',
    ],
  },
  {
    title: 'Donor Visibility',
    body: [
      'By default, your name and donation amount are shown on the campaign page.',
      'You can choose to donate anonymously — your name will be hidden from the public campaign page.',
      'Your contact details are never visible to campaign owners.',
    ],
  },
  {
    title: 'Data Retention',
    body: [
      'Account data is retained for as long as your account is active.',
      'Donation and withdrawal records are kept for 7 years for financial compliance.',
      'You may request deletion of your account by emailing privacy@gambiafund.gm. Legally required financial records will be retained even after deletion.',
    ],
  },
  {
    title: 'Your Rights',
    body: [
      'You may request a copy of the personal data we hold about you.',
      'You may correct inaccurate information from your account settings at any time.',
      'You may request deletion of your account and associated data.',
      'To exercise any of these rights, email privacy@gambiafund.gm.',
    ],
  },
  {
    title: 'Contact',
    body: [
      'Questions about this policy? Email privacy@gambiafund.gm.',
      'Last updated: June 2026.',
    ],
  },
]

export function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground">How GambiaFund collects, uses, and protects your personal information.</p>
      </div>

      <div className="space-y-8">
        {sections.map(({ title, body }) => (
          <div key={title}>
            <h2 className="font-semibold mb-3">{title}</h2>
            <ul className="space-y-2">
              {body.map((item, i) => (
                <li key={i} className="text-sm text-muted-foreground leading-relaxed flex gap-2">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary/40 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-12 flex flex-wrap gap-4 text-sm text-muted-foreground justify-center">
        <Link to={ROUTES.HELP} className="hover:text-foreground transition-colors">Help Center</Link>
        <Link to={ROUTES.TRUST_SAFETY} className="hover:text-foreground transition-colors">Trust &amp; Safety</Link>
        <Link to={ROUTES.TERMS} className="hover:text-foreground transition-colors">Terms of Service</Link>
      </div>
    </div>
  )
}
