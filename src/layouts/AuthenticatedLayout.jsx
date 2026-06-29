import { useState } from 'react'
import { Outlet, Link, useRouter } from '@tanstack/react-router'
import { useMe, useLogout } from '@/hooks/useAuth'
import { settings } from '@/settings'
import { ROUTES } from '@/constants'
import { initials } from '@/utils/formatters'
import { cn } from '@/utils/cn'
import {
  Heart, LayoutDashboard, PlusCircle, User, Settings,
  LogOut, Menu, X, Bell, ChevronDown, Flag,
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard', to: ROUTES.DASHBOARD, icon: LayoutDashboard },
  { label: 'My Campaigns', to: ROUTES.MY_CAMPAIGNS, icon: Flag },
  { label: 'Start Campaign', to: ROUTES.CAMPAIGN_NEW, icon: PlusCircle },
  { label: 'Profile', to: ROUTES.PROFILE, icon: User },
  { label: 'Settings', to: ROUTES.SETTINGS, icon: Settings },
]

export function AuthenticatedLayout() {
  const { data: user } = useMe()
  const logout = useLogout()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)

  const displayName = user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user?.email

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={[
          'fixed md:sticky top-0 left-0 h-screen z-30 w-64 bg-card border-r flex flex-col transition-transform duration-200',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        ].join(' ')}
      >
        {/* Logo */}
        <div className="h-16 px-5 border-b flex items-center justify-between">
          <Link to={ROUTES.HOME} className="flex items-center gap-2 font-bold text-lg">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Heart className="w-3.5 h-3.5 text-primary-foreground fill-primary-foreground" />
            </div>
            <span>{settings.siteName}</span>
          </Link>
          <button className="md:hidden p-1" onClick={() => setSidebarOpen(false)}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ label, to, icon: Icon }) => (
            <Link
              key={label}
              to={to}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors [&.active]:bg-primary/10 [&.active]:text-primary"
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        {/* User info */}
        <div className="p-3 border-t">
          <Link
            to={ROUTES.PROFILE}
            className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-accent transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold flex-shrink-0">
              {initials(displayName || user?.email)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{displayName}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </Link>
          <button
            onClick={() => logout.mutate()}
            className="w-full mt-1 flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 bg-card border-b px-4 sm:px-6 flex items-center justify-between sticky top-0 z-10">
          <button
            className="md:hidden p-2 rounded-md hover:bg-accent"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden md:block" />

          <div className="flex items-center gap-3">
            <Link
              to={ROUTES.CAMPAIGN_NEW}
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold bg-primary text-primary-foreground px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              New Campaign
            </Link>
            <button className="relative p-2 rounded-md hover:bg-accent">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-donate rounded-full" />
            </button>
            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold hover:opacity-90 transition-opacity"
              >
                {initials(displayName || user?.email)}
              </button>
              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-card border rounded-lg shadow-lg z-50">
                  <Link
                    to={ROUTES.PROFILE}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-accent transition-colors border-b"
                    onClick={() => setProfileMenuOpen(false)}
                  >
                    <User className="w-4 h-4" /> Profile
                  </Link>
                  <Link
                    to={ROUTES.SETTINGS}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-accent transition-colors border-b"
                    onClick={() => setProfileMenuOpen(false)}
                  >
                    <Settings className="w-4 h-4" /> Settings
                  </Link>
                  <button
                    onClick={() => {
                      logout.mutate()
                      setProfileMenuOpen(false)
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/5 transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 overflow-auto pb-20 md:pb-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-card border-t flex items-center safe-area-inset-bottom">
        {[
          { label: 'Home', to: ROUTES.DASHBOARD, icon: LayoutDashboard },
          { label: 'Campaigns', to: ROUTES.MY_CAMPAIGNS, icon: Flag },
          { label: 'New', to: ROUTES.CAMPAIGN_NEW, icon: PlusCircle, primary: true },
          { label: 'Profile', to: ROUTES.PROFILE, icon: User },
          { label: 'Settings', to: ROUTES.SETTINGS, icon: Settings },
        ].map(({ label, to, icon: Icon, primary }) => (
          <Link
            key={label}
            to={to}
            className={cn(
              'flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-xs transition-colors',
              primary
                ? 'text-primary-foreground'
                : 'text-muted-foreground [&.active]:text-primary',
            )}
          >
            {primary ? (
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-md shadow-primary/30 -mt-5">
                <Icon className="w-5 h-5 text-primary-foreground" />
              </div>
            ) : (
              <Icon className="w-5 h-5" />
            )}
            {!primary && <span>{label}</span>}
          </Link>
        ))}
      </nav>
    </div>
  )
}
