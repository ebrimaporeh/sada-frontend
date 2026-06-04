import { Outlet } from '@tanstack/react-router'
import { settings } from '@/settings'

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b px-6 py-4 flex items-center justify-between">
        <span className="font-semibold text-lg">{settings.siteName}</span>
      </header>
      <main className="flex-1 flex items-center justify-center p-6">
        <Outlet />
      </main>
      <footer className="border-t px-6 py-4 text-sm text-muted-foreground text-center">
        &copy; {new Date().getFullYear()} {settings.siteName}. All rights reserved.
      </footer>
    </div>
  )
}
