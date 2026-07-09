import { ChevronLeft, ChevronRight } from 'lucide-react'

// Windowed page list with '...' gaps, e.g. [1, '…', 8, 9, 10, 11, 12, '…', 79]
// — rendering every page number would overflow the bar once totalPages is large.
function getPageWindow(page, totalPages, siblingCount = 1) {
  const totalNumbers = siblingCount * 2 + 5 // first, last, current, 2 ellipses
  if (totalPages <= totalNumbers) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const left = Math.max(page - siblingCount, 2)
  const right = Math.min(page + siblingCount, totalPages - 1)

  const pages = [1]
  pages.push(left > 2 ? '…' : 2)
  for (let p = Math.max(left, 3); p <= Math.min(right, totalPages - 2); p++) {
    pages.push(p)
  }
  pages.push(right < totalPages - 1 ? '…' : totalPages - 1)
  pages.push(totalPages)

  // De-dupe in case the ranges above collapsed into adjacent values
  return pages.filter((p, i) => p !== pages[i - 1])
}

/**
 * Sticky footer pagination bar for admin list pages. Pinned to the bottom of
 * the scrollable page area (via `sticky bottom-0`) so it stays put as table
 * row count changes between pages, instead of shifting up/down with content.
 */
export function AdminPagination({ page, totalPages, onPageChange, totalCount, limit }) {
  if (totalPages <= 1) return null

  const showingRange = totalCount != null && limit != null
  const pageWindow = getPageWindow(page, totalPages)

  return (
    <div className="sticky bottom-0 z-10 -mx-4 px-4 sm:-mx-6 sm:px-6 py-3 mt-4 bg-background border-t shadow-[0_-2px_8px_rgba(0,0,0,0.04)] flex items-center justify-between flex-wrap gap-3">
      <p className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
        {showingRange && (
          <> · Showing {((page - 1) * limit) + 1}-{Math.min(page * limit, totalCount)} of {totalCount}</>
        )}
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="p-2 rounded-lg border bg-background hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-1">
          {pageWindow.map((p, i) =>
            p === '…' ? (
              <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-sm text-muted-foreground">
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`w-8 h-8 flex-shrink-0 rounded-lg text-sm font-medium transition-colors ${
                  p === page
                    ? 'bg-primary text-primary-foreground'
                    : 'border bg-background hover:bg-accent'
                }`}
              >
                {p}
              </button>
            )
          )}
        </div>
        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="p-2 rounded-lg border bg-background hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
