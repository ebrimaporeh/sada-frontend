import { useState } from 'react'
import { Search, SlidersHorizontal, X, SearchX } from 'lucide-react'
import { useCampaigns, useCategories } from '@/hooks/useCampaigns'
import { CampaignCard } from '@/components/custom/CampaignCard'
import { GAMBIA_REGIONS } from '@/constants'

export function CampaignGrid() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [region, setRegion] = useState('')
  const [urgent, setUrgent] = useState(false)

  const { campaigns } = useCampaigns({ search, category, region, urgent })
  const { categories } = useCategories()

  const hasFilters = search || category !== 'all' || region || urgent

  const clearFilters = () => {
    setSearch('')
    setCategory('all')
    setRegion('')
    setUrgent(false)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">All Campaigns</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {campaigns.length} campaign{campaigns.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Filters */}
      <div className="space-y-4 mb-8">
        {/* Search */}
        <div className="relative max-w-lg">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search campaigns, beneficiaries, regions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Category filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setCategory('all')}
              className={`text-sm px-3 py-1.5 rounded-full border font-medium transition-colors ${
                category === 'all' ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-accent'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(category === cat.slug ? 'all' : cat.slug)}
                className={`text-sm px-3 py-1.5 rounded-full border font-medium transition-colors ${
                  category === cat.slug ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-accent'
                }`}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Region */}
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="text-sm px-3 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">All Regions</option>
            {GAMBIA_REGIONS.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>

          {/* Urgent toggle */}
          <button
            onClick={() => setUrgent(!urgent)}
            className={`flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg border font-medium transition-colors ${
              urgent ? 'bg-red-50 border-red-300 text-red-700' : 'hover:bg-accent'
            }`}
          >
            🚨 Urgent only
          </button>

          {/* Clear filters */}
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

      {/* Grid */}
      {campaigns.length === 0 ? (
        <div className="text-center py-20">
          <SearchX className="w-10 h-10 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-semibold mb-2">No campaigns found</p>
          <p className="text-muted-foreground text-sm">Try adjusting your filters or search term.</p>
          <button onClick={clearFilters} className="mt-4 text-sm text-primary hover:underline">
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {campaigns.map((c) => (
            <CampaignCard key={c.id} campaign={c} />
          ))}
        </div>
      )}
    </div>
  )
}
