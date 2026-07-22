import { useState } from 'react'
import { Outlet, Link, useRouter, Navigate } from '@tanstack/react-router'
import { useMe, useLogout } from '@/hooks/useAuth'
import { ROUTES } from '@/constants'
import { cn } from '@/utils/cn'
import { isAdminAreaRole } from '@/utils/permissions'
import {
  LayoutDashboard, PlusCircle, User, Settings,
  LogOut, Menu, X, Megaphone, Bell, Home, ShieldCheck, Loader2,
} from 'lucide-react'
import { NotificationBell } from '@/components/custom/NotificationBell'
import { Logo } from '@/components/custom/Logo'

const navItems = [
  { label: 'Dashboard', to: ROUTES.DASHBOARD, icon: LayoutDashboard },
  { label: 'My Campaigns', to: ROUTES.MY_CAMPAIGNS, icon: Megaphone },
  { label: 'Start Campaign', to: ROUTES.CAMPAIGN_NEW, icon: PlusCircle },
  { label: 'Notifications', to: ROUTES.NOTIFICATIONS, icon: Bell },
  { label: 'Verification', to: ROUTES.VERIFICATION, icon: ShieldCheck },
  { label: 'Profile', to: ROUTES.PROFILE, icon: User },
  { label: 'Settings', to: ROUTES.SETTINGS, icon: Settings },
]

export function AuthenticatedLayout() {
  const { data: user, isLoading } = useMe()
  const logout = useLogout()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Redirect admin-area roles (admin, moderator, finance officer) to the admin layout
  if (!isLoading && isAdminAreaRole(user?.role)) {
    return <Navigate to="/admin" />
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

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
          <Link to={ROUTES.HOME} onClick={() => setSidebarOpen(false)}>
            <Logo imgClassName="h-7 w-auto" />
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
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors [&.active]:bg-primary/10 [&.active]:text-primary"
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Public site link */}
        <div className="p-3 border-t">
          <Link
            to={ROUTES.HOME}
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <Home className="w-4 h-4" />
            Public view
          </Link>
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
              className="inline-flex items-center gap-1.5 text-sm font-semibold bg-primary text-primary-foreground px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Campaign</span>
            </Link>
            <NotificationBell />
            <button
              onClick={() => logout.mutate()}
              disabled={logout.isPending}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/5 transition-colors disabled:opacity-50"
            >
              {logout.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
              <span className="hidden sm:inline">{logout.isPending ? 'Logging out…' : 'Logout'}</span>
            </button>
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
          { label: 'Campaigns', to: ROUTES.MY_CAMPAIGNS, icon: Megaphone },
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
