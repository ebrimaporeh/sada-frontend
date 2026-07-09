import { Outlet, Link, useRouter, Navigate } from '@tanstack/react-router'
import { useMe } from '@/hooks/useAuth'
import { ROLES, ROUTES } from '@/constants'
import { User, Users, Flag, Heart, LayoutDashboard, Home, LogOut, AlertCircle, BarChart3, Layers, Settings, ShieldCheck, Menu, X } from 'lucide-react'
import { cn } from '@/utils/cn'
import { settings } from '@/settings'
import { useEffect, useState } from 'react'

const navLinkClass = 'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-accent [&.active]:bg-primary/10 [&.active]:text-primary'

function SidebarNav({ onNavigate }) {
  return (
    <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
      <Link to="/admin" className={cn(navLinkClass)} onClick={onNavigate}>
        <LayoutDashboard className="w-4 h-4" /> Dashboard
      </Link>

      <div className="px-3 py-2 mt-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase">Management</p>
      </div>

      <Link to={ROUTES.ADMIN_USERS} className={cn(navLinkClass)} onClick={onNavigate}>
        <Users className="w-4 h-4" /> Users
      </Link>
      <Link to={ROUTES.ADMIN_CAMPAIGNS} className={cn(navLinkClass)} onClick={onNavigate}>
        <Flag className="w-4 h-4" /> Campaigns
      </Link>
      <Link to={ROUTES.ADMIN_DONATIONS} className={cn(navLinkClass)} onClick={onNavigate}>
        <Heart className="w-4 h-4" /> Donations
      </Link>
      <Link to="/admin/categories" className={cn(navLinkClass)} onClick={onNavigate}>
        <Layers className="w-4 h-4" /> Categories
      </Link>

      <div className="px-3 py-2 mt-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase">Moderation</p>
      </div>

      <Link to="/admin/reports" className={cn(navLinkClass)} onClick={onNavigate}>
        <AlertCircle className="w-4 h-4" /> Reports
      </Link>
      <Link to={ROUTES.ADMIN_VERIFICATIONS} className={cn(navLinkClass)} onClick={onNavigate}>
        <ShieldCheck className="w-4 h-4" /> Verifications
      </Link>

      <div className="px-3 py-2 mt-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase">Analytics</p>
      </div>

      <Link to="/admin/finances" className={cn(navLinkClass)} onClick={onNavigate}>
        <BarChart3 className="w-4 h-4" /> Finances
      </Link>

      <div className="px-3 py-2 mt-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase">Platform</p>
      </div>

      <Link to="/admin/settings" className={cn(navLinkClass)} onClick={onNavigate}>
        <Settings className="w-4 h-4" /> Settings
      </Link>
      <Link to={ROUTES.ADMIN_PROFILE} className={cn(navLinkClass)} onClick={onNavigate}>
        <User className="w-4 h-4" /> Profile
      </Link>
    </nav>
  )
}

function SidebarBrand() {
  return (
    <div className="px-5 py-4 border-b flex items-center gap-2">
      <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
        <Heart className="w-3.5 h-3.5 text-primary-foreground fill-primary-foreground" />
      </div>
      <div>
        <p className="font-bold text-sm">{settings.siteName}</p>
        <p className="text-xs text-muted-foreground">Admin Panel</p>
      </div>
    </div>
  )
}

function SidebarFooter({ onNavigate }) {
  return (
    <div className="p-3 border-t space-y-0.5">
      <Link
        to={ROUTES.HOME}
        onClick={onNavigate}
        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
      >
        <Home className="w-4 h-4" /> Public Site
      </Link>
    </div>
  )
}

export function AdminLayout() {
  const { data: user, isLoading } = useMe()
  const router = useRouter()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = mobileNavOpen ? 'hidden' : 'auto'
    return () => { document.body.style.overflow = 'auto' }
  }, [mobileNavOpen])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!user || user.role !== ROLES.ADMIN) {
    return <Navigate to={ROUTES.DASHBOARD} />
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    router.navigate({ to: ROUTES.LOGIN })
  }

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 border-r flex-col bg-card sticky top-0 h-screen flex-shrink-0">
        <SidebarBrand />
        <SidebarNav />
        <SidebarFooter />
      </aside>

      {/* Mobile nav overlay */}
      <div
        onClick={() => setMobileNavOpen(false)}
        className={cn(
          'md:hidden fixed inset-0 z-40 bg-black/50 transition-opacity',
          mobileNavOpen ? 'opacity-100' : 'opacity-0 pointer-events-none',
        )}
      />

      {/* Mobile nav drawer */}
      <aside
        className={cn(
          'md:hidden fixed inset-y-0 left-0 z-50 w-64 border-r bg-card flex flex-col shadow-lg transition-transform duration-300 ease-in-out',
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between border-b">
          <SidebarBrand />
          <button
            onClick={() => setMobileNavOpen(false)}
            className="p-2 mr-3 rounded-lg hover:bg-accent transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <SidebarNav onNavigate={() => setMobileNavOpen(false)} />
        <SidebarFooter onNavigate={() => setMobileNavOpen(false)} />
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="border-b bg-card px-4 sm:px-6 py-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => setMobileNavOpen(true)}
              className="md:hidden p-2 -ml-2 rounded-lg hover:bg-accent transition-colors flex-shrink-0"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold truncate">Admin Dashboard</h1>
          </div>
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 px-2 sm:px-4 py-2 rounded-lg hover:bg-accent transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                {user?.full_name?.charAt(0) || '?'}
              </div>
              <span className="hidden sm:inline text-sm font-medium max-w-[100px] truncate">{user?.full_name || user?.email}</span>
            </button>
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-card border rounded-lg shadow-lg z-50">
                <Link
                  to={ROUTES.ADMIN_PROFILE}
                  className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent transition-colors border-b"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <User className="w-4 h-4" /> Profile
                </Link>
                <button
                  onClick={() => {
                    handleLogout()
                    setShowProfileMenu(false)
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-destructive/5 transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            )}
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
