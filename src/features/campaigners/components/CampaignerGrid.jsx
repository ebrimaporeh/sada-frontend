import { useEffect, useRef, useState } from 'react'
import { Search, X, SearchX, Loader2 } from 'lucide-react'
import { usePublicCampaigners } from '@/hooks/useUsers'
import { CampaignerPhotoTile } from './CampaignerPhotoTile'
import { CampaignerCardSkeleton } from './CampaignerCardSkeleton'
import { Breadcrumbs } from '@/components/custom/Breadcrumbs'
import { Select } from '@/components/custom/Select'
import { GAMBIA_REGIONS } from '@/constants'

export function CampaignerGrid() {
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [region, setRegion] = useState('')

  const {
    campaigners, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage,
  } = usePublicCampaigners({ search, region })

  const hasFilters = search || searchInput || region
  const sentinelRef = useRef(null)

  const submitSearch = () => setSearch(searchInput)

  const clearFilters = () => {
    setSearchInput('')
    setSearch('')
    setRegion('')
  }

  // Auto-load the next page as the sentinel below the grid scrolls into
  // view; the "Load more" button below stays as a visible, click-driven
  // fallback for anyone who'd rather not rely on scroll-triggered loading.
  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return
    const node = sentinelRef.current
    if (!node) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) fetchNextPage() },
      { rootMargin: '600px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <Breadcrumbs current="Campaigners" />
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Campaigners</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {isLoading ? 'Loading campaigners…' : `${campaigners.length} campaigner${campaigners.length !== 1 ? 's' : ''} found`}
        </p>
      </div>

      {/* Filters */}
      <div className="space-y-4 mb-8">
        <div className="flex gap-2 max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search campaigners by name..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitSearch()}
              className="w-full pl-10 pr-9 py-2.5 rounded-lg border bg-background text-sm focus:outline-hidden focus:ring-2 focus:ring-ring"
            />
            {searchInput && (
              <button
                onClick={() => { setSearchInput(''); setSearch('') }}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>
          <button
            onClick={submitSearch}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Search className="w-4 h-4" />
            Search
          </button>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            placeholder="All Regions"
            className="w-44"
            buttonClassName="py-2"
            options={GAMBIA_REGIONS.map((r) => ({ value: r.value, label: r.label }))}
          />

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" /> Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Masonry grid */}
      {isLoading ? (
        <div className="columns-2 sm:columns-3 lg:columns-4 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <CampaignerCardSkeleton key={i} index={i} />
          ))}
        </div>
      ) : campaigners.length === 0 ? (
        <div className="text-center py-20">
          <SearchX className="w-10 h-10 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-semibold mb-2">No campaigners found</p>
          <p className="text-muted-foreground text-sm">Try adjusting your filters or search term.</p>
          <button onClick={clearFilters} className="mt-4 text-sm text-primary hover:underline">
            Clear all filters
          </button>
        </div>
      ) : (
        <>
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-4">
            {campaigners.map((c) => (
              <CampaignerPhotoTile key={c.id} campaigner={c} />
            ))}
          </div>

          {/* Scroll sentinel — triggers fetchNextPage when it enters the viewport */}
          <div ref={sentinelRef} className="h-1" />

          {hasNextPage && (
            <div className="flex justify-center mt-4">
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border bg-card hover:bg-accent transition-colors text-sm font-medium disabled:opacity-60"
              >
                {isFetchingNextPage ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {isFetchingNextPage ? 'Loading…' : 'Load more'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
