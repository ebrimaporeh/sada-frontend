import { Outlet, Link, useRouterState } from '@tanstack/react-router'
import { Heart, ChevronRight, MapPin, LayoutDashboard, Home, LayoutGrid, PlusCircle, LogIn } from 'lucide-react'
import { settings } from '@/settings'
import { ROUTES } from '@/constants'
import { useMe } from '@/hooks/useAuth'
import { cn } from '@/utils/cn'

export function PublicLayout() {
  const { data: me } = useMe()
  const { location } = useRouterState()
  const path = location.pathname

  const navLinks = [
    { label: 'Campaigns', to: ROUTES.CAMPAIGNS },
    { label: 'Campaigners', to: ROUTES.CAMPAIGNERS },
    { label: 'How It Works', to: '/#how-it-works' },
    { label: 'About', to: ROUTES.ABOUT },
  ]

  const bottomTabs = [
    { label: 'Home', to: ROUTES.HOME, icon: Home, exact: true },
    { label: 'Campaigns', to: ROUTES.CAMPAIGNS, icon: LayoutGrid },
    { label: 'Start', to: ROUTES.CAMPAIGN_NEW, icon: PlusCircle, cta: true },
    me
      ? { label: 'Dashboard', to: ROUTES.DASHBOARD, icon: LayoutDashboard }
      : { label: 'Sign in', to: ROUTES.LOGIN, icon: LogIn },
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b">
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
              to={ROUTES.CAMPAIGN_NEW}
              className="inline-flex items-center gap-1.5 text-sm font-semibold bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Start a Campaign
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 pb-20 md:pb-0">
        <Outlet />
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/95 backdrop-blur-sm border-t safe-area-bottom">
        <div className="flex items-end justify-around h-16 px-1">
          {bottomTabs.map(({ label, to, icon: Icon, exact, cta }) => {
            const isActive = exact ? path === to : path.startsWith(to)
            if (cta) {
              return (
                <Link
                  key={label}
                  to={to}
                  className="flex flex-col items-center gap-0.5 -mt-5"
                >
                  <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                    <Icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <span className="text-[10px] font-medium text-primary mt-0.5">{label}</span>
                </Link>
              )
            }
            return (
              <Link
                key={label}
                to={to}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors min-w-[60px]',
                  isActive ? 'text-primary' : 'text-muted-foreground',
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium leading-none">{label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

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
              {[['Campaigns', ROUTES.CAMPAIGNS], ['Start a Campaign', ROUTES.CAMPAIGN_NEW], ['How It Works', '/#how-it-works'], ['About Us', ROUTES.ABOUT]].map(([label, to]) => (
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
        <div className="border-t border-background/10 max-w-7xl mx-auto px-4 sm:px-6 py-4 pb-24 md:pb-4 flex flex-col sm:flex-row items-center justify-between gap-2">
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
