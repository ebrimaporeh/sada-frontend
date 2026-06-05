import { Outlet, Link, useRouter } from '@tanstack/react-router'
import { useMe } from '@/hooks/useAuth'
import { ROLES, ROUTES } from '@/constants'
import { Navigate } from '@tanstack/react-router'
import { Users, Flag, Heart, LayoutDashboard, ArrowLeft, Home } from 'lucide-react'
import { cn } from '@/utils/cn'
import { settings } from '@/settings'

const adminNav = [
  { label: 'Dashboard', to: ROUTES.ADMIN_USERS, icon: LayoutDashboard, exact: false },
  { label: 'Users', to: ROUTES.ADMIN_USERS, icon: Users },
  { label: 'Campaigns', to: ROUTES.ADMIN_CAMPAIGNS, icon: Flag },
  { label: 'Donations', to: ROUTES.ADMIN_DONATIONS, icon: Heart },
]

export function AdminLayout() {
  const { data: user, isLoading } = useMe()

  if (isLoading) return null

  if (!user || user.role !== ROLES.ADMIN) {
    return <Navigate to={ROUTES.DASHBOARD} />
  }

  return (
    <div className="min-h-screen bg-muted/30 flex">
      <aside className="w-60 border-r flex flex-col bg-card sticky top-0 h-screen">
        <div className="px-5 py-4 border-b flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <Heart className="w-3.5 h-3.5 text-primary-foreground fill-primary-foreground" />
          </div>
          <div>
            <p className="font-bold text-sm">{settings.siteName}</p>
            <p className="text-xs text-muted-foreground">Admin Panel</p>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          <Link
            to={ROUTES.ADMIN_USERS}
            className={cn('flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-accent')}
          >
            <LayoutDashboard className="w-4 h-4" /> Overview
          </Link>
          <Link
            to={ROUTES.ADMIN_USERS}
            className={cn('flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-accent')}
          >
            <Users className="w-4 h-4" /> Users
          </Link>
          <Link
            to={ROUTES.ADMIN_CAMPAIGNS}
            className={cn('flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-accent')}
          >
            <Flag className="w-4 h-4" /> Campaigns
          </Link>
          <Link
            to={ROUTES.ADMIN_DONATIONS}
            className={cn('flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-accent')}
          >
            <Heart className="w-4 h-4" /> Donations
          </Link>
        </nav>
        <div className="p-3 border-t space-y-0.5">
          <Link
            to={ROUTES.DASHBOARD}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to App
          </Link>
          <Link
            to={ROUTES.HOME}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <Home className="w-4 h-4" /> Public Site
          </Link>
        </div>
      </aside>
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
