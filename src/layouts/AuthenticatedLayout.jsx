import { Outlet, Link } from '@tanstack/react-router'
import { useMe, useLogout } from '@/hooks/useAuth'
import { settings } from '@/settings'
import { ROUTES } from '@/constants'

export function AuthenticatedLayout() {
  const { data: user } = useMe()
  const logout = useLogout()

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-64 border-r flex flex-col bg-card">
        <div className="p-6 border-b">
          <span className="font-bold text-lg">{settings.siteName}</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <Link to={ROUTES.DASHBOARD} className="block px-3 py-2 rounded-md text-sm hover:bg-accent">
            Dashboard
          </Link>
          <Link to={ROUTES.PROFILE} className="block px-3 py-2 rounded-md text-sm hover:bg-accent">
            Profile
          </Link>
          <Link to={ROUTES.SETTINGS} className="block px-3 py-2 rounded-md text-sm hover:bg-accent">
            Settings
          </Link>
        </nav>
        <div className="p-4 border-t">
          <p className="text-sm text-muted-foreground truncate mb-2">{user?.email}</p>
          <button
            onClick={() => logout.mutate()}
            className="text-sm text-destructive hover:underline"
          >
            Sign out
          </button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="border-b px-6 py-4 flex items-center justify-between bg-card">
          <h1 className="font-semibold">Welcome, {user?.first_name || user?.email}</h1>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
