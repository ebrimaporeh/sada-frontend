import { Heart } from 'lucide-react'
import { useSiteSettings } from '@/hooks/useSiteSettings'
import { cn } from '@/utils/cn'

// Renders the admin-configured logo. `variant="with-background"` uses the
// logo-on-its-own-background asset instead of the transparent one — pick
// that on dark surfaces (e.g. the footer) where a transparent wordmark
// would lose contrast; use the default transparent variant everywhere else.
export function Logo({ className, imgClassName = 'h-8 w-auto', variant = 'transparent' }) {
  const { siteName, logo, logoWithBackground } = useSiteSettings()
  const src = variant === 'with-background' ? (logoWithBackground || logo) : logo

  if (src) {
    return <img src={src} alt={siteName} className={cn(imgClassName, variant === 'with-background' && 'rounded-md', className)} />
  }

  return (
    <span className={cn('flex items-center gap-2 font-bold text-xl', className)}>
      <span className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
        <Heart className="w-4 h-4 text-primary-foreground fill-primary-foreground" />
      </span>
      <span className="text-current">{siteName}</span>
    </span>
  )
}
