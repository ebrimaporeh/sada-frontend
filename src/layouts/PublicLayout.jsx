import { useState } from 'react'
import { Outlet, Link, useRouter } from '@tanstack/react-router'
import { Heart, Menu, X, ChevronRight, MapPin, LayoutDashboard } from 'lucide-react'
import { settings } from '@/settings'
import { ROUTES } from '@/constants'
import { useMe } from '@/hooks/useAuth'

export function PublicLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { data: me } = useMe()

  const navLinks = [
    { label: 'Campaigns', to: ROUTES.CAMPAIGNS },
    { label: 'How It Works', to: '/#how-it-works' },
    { label: 'About', to: '/#about' },
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to={ROUTES.HOME} className="flex items-center gap-2 font-bold text-xl">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Heart className="w-4 h-4 text-primary-foreground fill-primary-foreground" />
            </div>
            <span className="text-foreground">{settings.siteName}</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {me ? (
              <Link
                to={ROUTES.DASHBOARD}
                className="inline-flex items-center gap-1.5 text-sm font-medium hover:text-primary transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
            ) : (
              <Link to={ROUTES.LOGIN} className="text-sm font-medium hover:text-primary transition-colors">
                Sign in
              </Link>
            )}
            <Link
              to={ROUTES.CAMPAIGNS}
              className="inline-flex items-center gap-1.5 text-sm font-semibold bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Start a Campaign
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-accent"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-background px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="block text-sm py-1.5 text-muted-foreground hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t flex flex-col gap-2">
              {me ? (
                <Link
                  to={ROUTES.DASHBOARD}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-medium text-center py-2 border rounded-lg"
                >
                  Dashboard
                </Link>
              ) : (
                <Link to={ROUTES.LOGIN} className="text-sm font-medium text-center py-2 border rounded-lg">
                  Sign in
                </Link>
              )}
              <Link
                to={ROUTES.CAMPAIGN_NEW}
                className="text-sm font-semibold text-center py-2 bg-primary text-primary-foreground rounded-lg"
              >
                Start a Campaign
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-foreground text-background mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 font-bold text-xl mb-3">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                <Heart className="w-3.5 h-3.5 fill-primary-foreground text-primary-foreground" />
              </div>
              {settings.siteName}
            </div>
            <p className="text-sm text-background/60 leading-relaxed max-w-sm">
              The Gambia's crowdfunding platform. Helping Gambians raise funds for medical, education, community, and more — powered by local mobile money.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-xs text-background/50">Payments powered by</span>
              <span className="text-sm font-bold text-background/80">ModemPay</span>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold mb-3">Platform</p>
            <ul className="space-y-2 text-sm text-background/60">
              {[['Campaigns', ROUTES.CAMPAIGNS], ['Start a Campaign', ROUTES.CAMPAIGN_NEW], ['How It Works', '/'], ['About Us', '/']].map(([label, to]) => (
                <li key={label}>
                  <Link to={to} className="hover:text-background transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold mb-3">Support</p>
            <ul className="space-y-2 text-sm text-background/60">
              {[
                ['Help Center', ROUTES.HELP],
                ['Trust & Safety', ROUTES.TRUST_SAFETY],
                ['Privacy Policy', ROUTES.PRIVACY],
                ['Terms of Service', ROUTES.TERMS],
              ].map(([label, to]) => (
                <li key={label}>
                  <Link to={to} className="hover:text-background transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-background/10 max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-background/40 flex items-center gap-1">
            &copy; {new Date().getFullYear()} {settings.siteName}. Made with <Heart className="w-3 h-3 fill-current text-red-400" /> in The Gambia.
          </p>
          <p className="text-xs text-background/40 flex items-center gap-1">
            <MapPin className="w-3 h-3" /> Built for Gambians, by Gambians.
          </p>
        </div>
      </footer>
    </div>
  )
}
