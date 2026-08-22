import { Link } from '@tanstack/react-router'
import { ROUTES } from '@/constants'
import { cn } from '@/utils/cn'
import { Logo } from '@/components/custom/Logo'
import { usePageMeta } from '@/hooks/usePageMeta'

/**
 * Shared centered-card wrapper for auth pages (login, register, forgot/reset
 * password, verify email) — was duplicated identically across all five.
 * `title` sets the page title; these are never worth indexing (no unique
 * content, and a login/reset-password URL isn't something search traffic
 * should land on), so noindex is fixed, not a prop.
 */
export function AuthShell({ children, className, title }) {
  usePageMeta({ title, noindex: true })

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center px-4 py-10 bg-muted/20">
      <Link to={ROUTES.HOME} className="mb-8">
        <Logo imgClassName="h-9 w-auto" />
      </Link>

      <div className={cn('w-full max-w-sm bg-card border rounded-2xl shadow-brand-sm p-8', className)}>
        {children}
      </div>
    </div>
  )
}
