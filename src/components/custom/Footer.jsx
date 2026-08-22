import { Link } from '@tanstack/react-router'
import { Heart, MapPin, ArrowRight, Smartphone } from 'lucide-react'
import { settings } from '@/settings'
import { ROUTES } from '@/constants'
import { Logo } from '@/components/custom/Logo'
import { useSiteSettings } from '@/hooks/useSiteSettings'

const PLATFORM_LINKS = [
  ['Campaigns', ROUTES.CAMPAIGNS],
  ['Start a Campaign', ROUTES.CAMPAIGN_NEW],
  ['Zakat Calculator', ROUTES.ZAKAT],
  ['How It Works', '/#how-it-works'],
  ['About Us', ROUTES.ABOUT],
  ['Platform Vision', ROUTES.VISION],
]

const SUPPORT_LINKS = [
  ['Help Center', ROUTES.HELP],
  ['Trust & Safety', ROUTES.TRUST_SAFETY],
  ['Privacy Policy', ROUTES.PRIVACY],
  ['Terms of Service', ROUTES.TERMS],
]

const PAYMENT_PARTNERS = ['Wave', 'APS', 'Card (Stripe)']

export function Footer() {
  const { siteName } = useSiteSettings()
  return (
    <footer className="mt-16 bg-foreground text-background">
      {/* CTA strip */}
      <div className="relative overflow-hidden border-b border-background/10">
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(white 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-left">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold">Ready to make a difference?</h3>
            <p className="text-sm text-background/60 mt-1">
              Start a campaign in minutes — no fees taken off donations you receive.
            </p>
          </div>
          <Link
            to={ROUTES.CAMPAIGN_NEW}
            className="inline-flex items-center gap-1.5 text-sm font-semibold bg-primary text-primary-foreground px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity shadow-brand-md flex-shrink-0"
          >
            Start a Campaign
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-2 md:grid-cols-5 gap-x-6 gap-y-10">
        <div className="col-span-2 md:col-span-2">
          <Link to={ROUTES.HOME} className="mb-3 w-fit block">
            <Logo variant="with-background" imgClassName="h-7 w-auto" />
          </Link>
          <p className="text-sm text-background/60 leading-relaxed max-w-sm">
            {settings.country}'s crowdfunding platform. Helping Gambians raise funds for medical,
            education, community, and more — powered by local mobile money.
          </p>

          <div className="mt-5">
            <p className="text-xs font-semibold text-background/50 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5" /> Donate with
            </p>
            <div className="flex flex-wrap gap-1.5">
              {PAYMENT_PARTNERS.map((name) => (
                <span
                  key={name}
                  className="text-xs font-medium text-background/70 border border-background/15 rounded-full px-2.5 py-1"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold mb-3">Platform</p>
          <ul className="space-y-2.5 text-sm text-background/60">
            {PLATFORM_LINKS.map(([label, to]) => (
              <li key={label}>
                <Link to={to} className="hover:text-background transition-colors">{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold mb-3">Support</p>
          <ul className="space-y-2.5 text-sm text-background/60">
            {SUPPORT_LINKS.map(([label, to]) => (
              <li key={label}>
                <Link to={to} className="hover:text-background transition-colors">{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="col-span-2 md:col-span-1">
          <p className="text-sm font-semibold mb-3">Payments</p>
          <p className="text-sm text-background/60 leading-relaxed">
            Secured and powered by
            <br />
            <span className="font-semibold text-background/80">Stripe</span> &amp;{' '}
            <span className="font-semibold text-background/80">ModemPay</span>
          </p>
        </div>
      </div>

      <div className="border-t border-background/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 pb-24 md:pb-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-background/40 flex items-center gap-1">
            &copy; {new Date().getFullYear()} {siteName}. Made with <Heart className="w-3 h-3 fill-current text-red-400" /> in The Gambia.
          </p>
          <p className="text-xs text-background/40 flex items-center gap-1">
            <MapPin className="w-3 h-3" /> Built for Gambians, by Gambians.
          </p>
        </div>
      </div>
    </footer>
  )
}
