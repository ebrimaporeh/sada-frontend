import { Link } from '@tanstack/react-router'
import { LoadingSpinner } from '@/components/custom/LoadingSpinner'
import { Breadcrumbs } from '@/components/custom/Breadcrumbs'
import { useCategories } from '@/hooks/useCampaigns'
import { getCategoryIcon } from '@/utils/categoryIcons'
import { formatGMD } from '@/utils/formatters'
import { usePageMeta } from '@/hooks/usePageMeta'
import { ROUTES } from '@/constants'

export function CategoriesPage() {
  const { categories, isLoading } = useCategories()

  usePageMeta({
    title: 'Categories',
    description: 'Browse every cause on the platform, ranked by total donations raised.',
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <Breadcrumbs current="Categories" />
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">All Categories</h1>
        <p className="text-muted-foreground mt-4 text-lg max-w-2xl mx-auto">
          Browse every cause on the platform, ranked by total donations raised.
        </p>
      </div>

      {isLoading ? (
        <LoadingSpinner className="py-32" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => {
          const Icon = getCategoryIcon(cat.icon)
          return (
            <Link
              key={cat.id}
              to={ROUTES.CAMPAIGNS}
              search={{ category: cat.slug }}
              className="group flex flex-col rounded-xl overflow-hidden border border-border hover:border-primary/50 hover:shadow-xl transition-all cursor-pointer"
            >
              <div className="relative h-56 overflow-hidden bg-muted">
                {cat.image_url ? (
                  <img
                    src={cat.image_url}
                    alt={cat.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-linear-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                    <Icon className="w-14 h-14 text-primary/70" strokeWidth={1.5} />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300" />
                {cat.total_donated > 0 && (
                  <span className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm text-xs font-semibold px-2.5 py-1 rounded-full">
                    {formatGMD(cat.total_donated)} raised
                  </span>
                )}
              </div>

              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                    {cat.name}
                  </h3>
                  <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
                    {cat.campaign_count} campaign{cat.campaign_count === 1 ? '' : 's'}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                  {cat.description}
                </p>
              </div>
            </Link>
          )})}
        </div>
      )}
    </div>
  )
}
