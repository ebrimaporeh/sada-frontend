import { useRef } from 'react'
import { Link } from '@tanstack/react-router'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { useCategories } from '@/hooks/useCampaigns'
import { getCategoryIcon } from '@/utils/categoryIcons'
import { ROUTES } from '@/constants'

function CategoryCard({ cat }) {
  const Icon = getCategoryIcon(cat.icon)
  return (
    <Link
      to={ROUTES.CAMPAIGNS}
      search={{ category: cat.slug }}
      className="group flex flex-col rounded-2xl overflow-hidden border hover:border-primary/50 hover:shadow-xl transition-all cursor-pointer bg-card"
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
          <div className="w-full h-full bg-linear-to-br from-primary/15 to-primary/5 flex items-center justify-center">
            <Icon className="w-14 h-14 text-primary/70" strokeWidth={1.5} />
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300" />
        {/* <div className="absolute top-3 left-3 w-9 h-9 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center">
          <Icon className="w-4 h-4 text-primary" />
        </div> */}
      </div>

      <div className="p-4 space-y-1.5">
        <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
          {cat.name}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
          {cat.description}
        </p>
      </div>
    </Link>
  )
}

export function CategoriesSection() {
  const { categories } = useCategories()
  const scrollContainerRef = useRef(null)

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      })
    }
  }

  return (
    <section className="bg-background py-20 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
          <div>
            <div className="section-label">
              <div className="section-label-line" />
              <span className="section-label-text">Browse Causes</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              Fundraisers for every cause
            </h2>
            <p className="text-muted-foreground mt-3 text-lg max-w-xl">
              Ranked by community support — the causes Gambians are rallying behind right now.
            </p>
          </div>
          <Link
            to={ROUTES.CATEGORIES}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline flex-shrink-0"
          >
            All Categories <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Mobile / tablet: horizontal scroll */}
        <div className="lg:hidden relative">
          <button
            onClick={() => scroll('left')}
            className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 -ml-4 p-2 rounded-full bg-background border hover:bg-accent transition-colors shadow-md"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 -mr-4 p-2 rounded-full bg-background border hover:bg-accent transition-colors shadow-md"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto scroll-smooth scrollbar-hide pb-2"
          >
            {categories.map((cat) => (
              <div key={cat.id} className="flex-shrink-0 w-64">
                <CategoryCard cat={cat} />
              </div>
            ))}
          </div>
        </div>

        {/* Desktop: grid */}
        <div className="hidden lg:grid grid-cols-4 gap-5">
          {categories.slice(0, 8).map((cat) => (
            <CategoryCard key={cat.id} cat={cat} />
          ))}
        </div>
      </div>
    </section>
  )
}
