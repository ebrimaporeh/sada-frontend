import { Outlet, Link, Navigate } from '@tanstack/react-router'
import { useMe, useLogout } from '@/hooks/useAuth'
import { ROUTES } from '@/constants'
import { User, Users, UserCog, Megaphone, Heart, LayoutDashboard, Home, LogOut, AlertCircle, BarChart3, Layers, Settings, ShieldCheck, Menu, X, Loader2, ClipboardList } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useEffect, useState } from 'react'
import { Resource, hasResourceAccess, isAdminAreaRole } from '@/utils/permissions'
import { useAdminBadgeCounts } from '@/hooks/useAdmin'
import { Logo } from '@/components/custom/Logo'

const navLinkClass = 'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-accent [&.active]:bg-primary/10 [&.active]:text-primary'

function NavSectionLabel({ children }) {
  return (
    <div className="px-3 py-2 mt-4">
      <p className="text-xs font-semibold text-muted-foreground uppercase">{children}</p>
    </div>
  )
}

function NavBadge({ count }) {
  if (!count) return null
  return (
    <span className="ml-auto flex-shrink-0 min-w-[18px] h-[18px] px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
      {count > 99 ? '99+' : count}
    </span>
  )
}

// Every link is gated on the exact same resource its route already enforces
// server-side and via requireResource() in rootRoute.jsx — this only ever
// hides links the user couldn't use anyway, it isn't itself a security
// boundary. `resources` is the current user's own live resource list (see
// src/utils/permissions.js), not a static role → resource map.
function SidebarNav({ onNavigate, resources }) {
  const can = (resource) => hasResourceAccess(resources, resource)
  // The Staff page now has a Roles & Permissions tab too, so its link
  // should show for anyone who can use either half of that page.
  const canStaff = can(Resource.STAFF_VIEW) || can(Resource.ROLES_MANAGE)
  const showManagement = can(Resource.USERS_VIEW) || canStaff || can(Resource.CAMPAIGNS_VIEW) || can(Resource.DONATIONS_VIEW) || can(Resource.CATEGORIES_VIEW)
  const showModeration = can(Resource.REPORTS_VIEW) || can(Resource.VERIFICATIONS_VIEW)
  const { pendingReports, pendingVerifications } = useAdminBadgeCounts({ enabled: showModeration })

  return (
    <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
      {can(Resource.DASHBOARD_VIEW) && (
        <Link to="/admin" activeOptions={{ exact: true }} className={cn(navLinkClass)} onClick={onNavigate}>
          <LayoutDashboard className="w-4 h-4" /> Dashboard
        </Link>
      )}

      {showManagement && <NavSectionLabel>Management</NavSectionLabel>}
      {can(Resource.USERS_VIEW) && (
        <Link to={ROUTES.ADMIN_USERS} className={cn(navLinkClass)} onClick={onNavigate}>
          <Users className="w-4 h-4" /> Campaigners
        </Link>
      )}
      {canStaff && (
        <Link to={ROUTES.ADMIN_STAFF} className={cn(navLinkClass)} onClick={onNavigate}>
          <UserCog className="w-4 h-4" /> Staff
        </Link>
      )}
      {can(Resource.CAMPAIGNS_VIEW) && (
        <Link to={ROUTES.ADMIN_CAMPAIGNS} className={cn(navLinkClass)} onClick={onNavigate}>
          <Megaphone className="w-4 h-4" /> Campaigns
        </Link>
      )}
      {can(Resource.DONATIONS_VIEW) && (
        <Link to={ROUTES.ADMIN_DONATIONS} className={cn(navLinkClass)} onClick={onNavigate}>
          <Heart className="w-4 h-4" /> Donations
        </Link>
      )}
      {can(Resource.CATEGORIES_VIEW) && (
        <Link to="/admin/categories" className={cn(navLinkClass)} onClick={onNavigate}>
          <Layers className="w-4 h-4" /> Categories
        </Link>
      )}

      {showModeration && <NavSectionLabel>Moderation</NavSectionLabel>}
      {can(Resource.REPORTS_VIEW) && (
        <Link to="/admin/reports" className={cn(navLinkClass)} onClick={onNavigate}>
          <AlertCircle className="w-4 h-4" /> Reports
          <NavBadge count={pendingReports} />
        </Link>
      )}
      {can(Resource.VERIFICATIONS_VIEW) && (
        <Link to={ROUTES.ADMIN_VERIFICATIONS} className={cn(navLinkClass)} onClick={onNavigate}>
          <ShieldCheck className="w-4 h-4" /> Verifications
          <NavBadge count={pendingVerifications} />
        </Link>
      )}

      {can(Resource.FINANCES_VIEW) && (
        <>
          <NavSectionLabel>Analytics</NavSectionLabel>
          <Link to="/admin/finances" className={cn(navLinkClass)} onClick={onNavigate}>
            <BarChart3 className="w-4 h-4" /> Finances
          </Link>
        </>
      )}

      <NavSectionLabel>Platform</NavSectionLabel>
      {can(Resource.SETTINGS_EDIT) && (
        <Link to="/admin/settings" className={cn(navLinkClass)} onClick={onNavigate}>
          <Settings className="w-4 h-4" /> Settings
        </Link>
      )}
      {can(Resource.AUDIT_VIEW) && (
        <Link to={ROUTES.ADMIN_AUDIT} className={cn(navLinkClass)} onClick={onNavigate}>
          <ClipboardList className="w-4 h-4" /> Activity Log
        </Link>
      )}
      <Link to={ROUTES.ADMIN_PROFILE} className={cn(navLinkClass)} onClick={onNavigate}>
        <User className="w-4 h-4" /> Profile
      </Link>
      {/* <Link to={ROUTES.ADMIN_VERIFICATION} className={cn(navLinkClass)} onClick={onNavigate}>
        <ShieldCheck className="w-4 h-4" /> My Verification
      </Link> */}
    </nav>
  )
}

function SidebarBrand() {
  return (
    <div className="px-5 py-4 border-b flex items-center gap-2">
      <Logo imgClassName="h-7 w-auto" />
    </div>
  )
}

function SidebarFooter({ onNavigate }) {
  const logout = useLogout()

  return (
    <div className="p-3 border-t space-y-0.5">
      <button
        onClick={() => logout.mutate()}
        disabled={logout.isPending}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/5 transition-colors disabled:opacity-50"
      >
        {logout.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
        {logout.isPending ? 'Logging out…' : 'Logout'}
      </button>
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

  if (!user || !isAdminAreaRole(user)) {
    return <Navigate to={ROUTES.DASHBOARD} />
  }

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 border-r flex-col bg-card sticky top-0 h-screen flex-shrink-0">
        <SidebarBrand />
        <SidebarNav resources={user.resources} />
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
        <SidebarNav resources={user.resources} onNavigate={() => setMobileNavOpen(false)} />
        <SidebarFooter onNavigate={() => setMobileNavOpen(false)} />
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile-only menu trigger — the sidebar (desktop aside / mobile
            drawer, both above) is otherwise unreachable once the header is
            gone, since it's the only nav affordance on small screens. */}
        <button
          onClick={() => setMobileNavOpen(true)}
          className="md:hidden p-2 m-2 rounded-lg hover:bg-accent transition-colors self-start flex-shrink-0"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
