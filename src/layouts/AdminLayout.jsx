import { Outlet, Link } from '@tanstack/react-router'
import { useMe } from '@/hooks/useAuth'
import { ROLES, ROUTES } from '@/constants'
import { Navigate } from '@tanstack/react-router'

export function AdminLayout() {
  const { data: user, isLoading } = useMe()

  if (isLoading) return null

  if (!user || user.role !== ROLES.ADMIN) {
    return <Navigate to={ROUTES.DASHBOARD} />
  }

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-64 border-r flex flex-col bg-card">
        <div className="p-6 border-b">
          <span className="font-bold text-sm uppercase tracking-wider text-muted-foreground">
            Admin Panel
          </span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <Link to={ROUTES.ADMIN_USERS} className="block px-3 py-2 rounded-md text-sm hover:bg-accent">
            Users
          </Link>
          <Link to={ROUTES.DASHBOARD} className="block px-3 py-2 rounded-md text-sm hover:bg-accent">
            Back to App
          </Link>
        </nav>
      </aside>
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
