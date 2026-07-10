import { Heart } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { settings } from '@/settings'
import { ROUTES } from '@/constants'
import { cn } from '@/utils/cn'

/**
 * Shared centered-card wrapper for auth pages (login, register, forgot/reset
 * password, verify email) — was duplicated identically across all five.
 */
export function AuthShell({ children, className }) {
  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center px-4 py-10 bg-muted/20">
      <Link to={ROUTES.HOME} className="flex items-center gap-2 mb-8">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-brand-sm">
          <Heart className="w-4.5 h-4.5 text-primary-foreground fill-primary-foreground" />
        </div>
        <span className="font-display font-bold text-xl text-foreground">{settings.siteName}</span>
      </Link>

      <div className={cn('w-full max-w-sm bg-card border rounded-2xl shadow-brand-sm p-8', className)}>
        {children}
      </div>
    </div>
  )
}
