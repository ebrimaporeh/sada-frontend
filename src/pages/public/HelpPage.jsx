import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { ROUTES } from '@/constants'

const faqs = [
  {
    q: 'How do I start a campaign?',
    a: 'Create a free account, click "Start a Campaign", and fill in your campaign details — title, story, goal, and deadline. Once submitted, our team reviews it within 24 hours and notifies you when it goes live.',
  },
  {
    q: 'What fees does GambiaFund charge?',
    a: 'GambiaFund charges 0% platform fee. A 1.5% transaction fee applies to each donation, charged by ModemPay for processing the mobile money payment.',
  },
  {
    q: 'How do I donate to a campaign?',
    a: 'Find a campaign you want to support, click "Donate Now", enter your amount and mobile money number, then confirm the payment prompt on your phone. Your donation is recorded immediately.',
  },
  {
    q: 'Which mobile money networks are supported?',
    a: 'We currently support ModemPay (all networks), Wave, Orange Money, and Afrimoney. More providers will be added soon.',
  },
  {
    q: 'When can I withdraw raised funds?',
    a: 'You can request a withdrawal at any time after your campaign is approved and has received donations. Go to your campaign management page, open the Withdraw tab, and submit a withdrawal request.',
  },
  {
    q: 'How long does a withdrawal take?',
    a: 'Withdrawals are typically processed within 1–3 business days. You will receive a notification once the funds are sent to your mobile money account.',
  },
  {
    q: 'Can I donate anonymously?',
    a: 'Yes. When donating, check the "Donate anonymously" option. Your name will not be shown publicly on the campaign page, though the donation amount is still counted.',
  },
  {
    q: 'What happens if a campaign doesn\'t reach its goal?',
    a: 'GambiaFund uses a keep-it-all model. Campaign owners receive all funds raised regardless of whether the goal is met.',
  },
  {
    q: 'How do I update or pause my campaign?',
    a: 'Go to "My Campaigns", select your campaign, and open the Edit tab. From there you can update your campaign details, upload new photos, post updates for donors, or pause the campaign temporarily.',
  },
  {
    q: 'How do I contact support?',
    a: 'Email us at support@gambiafund.gm or reach us on WhatsApp at +220 000 0000. We respond within one business day.',
  },
]

function FAQ({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left flex items-center justify-between gap-4 px-5 py-4 hover:bg-muted/50 transition-colors"
      >
        <span className="font-medium text-sm">{q}</span>
        {open ? <ChevronUp className="w-4 h-4 flex-shrink-0 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 flex-shrink-0 text-muted-foreground" />}
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed border-t pt-4">
          {a}
        </div>
      )}
    </div>
  )
}

export function HelpPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold mb-2">Help Center</h1>
        <p className="text-muted-foreground">Answers to the most common questions about GambiaFund.</p>
      </div>

      <div className="space-y-3">
        {faqs.map((item) => (
          <FAQ key={item.q} q={item.q} a={item.a} />
        ))}
      </div>

      <div className="mt-12 bg-muted rounded-2xl p-6 text-center">
        <p className="font-semibold mb-1">Still have questions?</p>
        <p className="text-sm text-muted-foreground mb-4">Our support team is happy to help.</p>
        <a
          href="mailto:support@gambiafund.gm"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-colors"
        >
          Email Support
        </a>
      </div>

      <div className="mt-8 flex flex-wrap gap-4 text-sm text-muted-foreground justify-center">
        <Link to={ROUTES.TRUST_SAFETY} className="hover:text-foreground transition-colors">Trust &amp; Safety</Link>
        <Link to={ROUTES.PRIVACY} className="hover:text-foreground transition-colors">Privacy Policy</Link>
        <Link to={ROUTES.TERMS} className="hover:text-foreground transition-colors">Terms of Service</Link>
      </div>
    </div>
  )
}
