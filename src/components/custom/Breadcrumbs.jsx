import { Link } from '@tanstack/react-router'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/utils/cn'

/**
 * `items` is everything between Home and the current page — an array of
 * `{ label, to, params? }`. `current` (plain text, not a link) is the page
 * you're actually on. Also emits a BreadcrumbList JSON-LD block, which is
 * what lets Google show these as breadcrumbs directly in search results
 * instead of a raw URL.
 */
export function Breadcrumbs({ items = [], current, className }) {
  const allItems = [{ label: 'Home', to: '/' }, ...items]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [...allItems, { label: current }].map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.label,
      ...(item.to ? { item: `${window.location.origin}${item.to}` } : {}),
    })),
  }
  // A campaign title (or any other user-supplied label here) could contain
  // "</script>" and break out of this tag if embedded verbatim -- the HTML
  // parser looks for that literal byte sequence regardless of JSON string
  // escaping, so it has to be neutralized separately.
  const jsonLdSafe = JSON.stringify(jsonLd).replace(/</g, '\\u003c')

  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center flex-wrap gap-1.5 text-sm text-muted-foreground mb-4', className)}>
      {allItems.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {item.to ? (
            <Link to={item.to} params={item.params} className="hover:text-foreground transition-colors">
              {i === 0 ? <Home className="w-3.5 h-3.5" /> : item.label}
            </Link>
          ) : (
            <span>{item.label}</span>
          )}
          <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
        </span>
      ))}
      <span className="text-foreground font-medium truncate">{current}</span>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdSafe }} />
    </nav>
  )
}
