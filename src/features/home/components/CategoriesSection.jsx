import { useRef } from 'react'
import { Link } from '@tanstack/react-router'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCategories } from '@/hooks/useCampaigns'
import { ROUTES } from '@/constants'

export function CategoriesSection() {
  const { categories } = useCategories()
  const scrollContainerRef = useRef(null)

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320 // Card width + gap
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      })
    }
  }

  return (
    <section className="bg-background py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
            Fundraisers for every cause
          </h2>
          <p className="text-muted-foreground mt-4 text-lg max-w-2xl mx-auto">
            Medical. Education. Community. Faith. Emergency. All the causes that matter to The Gambia.
          </p>
        </div>

        <div className="flex justify-end mb-6">
          <Link
            to={ROUTES.CATEGORIES}
            className="text-sm font-semibold text-primary hover:underline"
          >
            All Categories →
          </Link>
        </div>

        {/* Mobile Horizontal Scroll */}
        <div className="md:hidden">
          <div className="relative">
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 -ml-3 p-2 rounded-full bg-background border border-border hover:bg-accent transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 -mr-3 p-2 rounded-full bg-background border border-border hover:bg-accent transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <div
              ref={scrollContainerRef}
              className="flex gap-4 overflow-x-auto scroll-smooth pb-2"
              style={{ scrollBehavior: 'smooth', scrollbarWidth: 'none' }}
            >
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={ROUTES.CAMPAIGNS}
                  search={{ category: cat.slug }}
                  className="group flex-shrink-0 w-72 flex flex-col rounded-xl overflow-hidden border border-border hover:border-primary/50 hover:shadow-xl transition-all cursor-pointer"
                >
                  {/* Image Container */}
                  <div className="relative h-64 overflow-hidden bg-muted">
                    {cat.image_url ? (
                      <img
                        src={cat.image_url}
                        alt={cat.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                        <span className="text-6xl">{cat.icon || '📁'}</span>
                      </div>
                    )}

                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300" />
                  </div>

                  {/* Text Content */}
                  <div className="p-4 space-y-2">
                    <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                      {cat.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop Grid */}
        <div className="hidden md:grid grid-cols-3 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={ROUTES.CAMPAIGNS}
              search={{ category: cat.slug }}
              className="group flex flex-col rounded-xl overflow-hidden border border-border hover:border-primary/50 hover:shadow-xl transition-all cursor-pointer"
            >
              {/* Image Container */}
              <div className="relative h-64 overflow-hidden bg-muted">
                {cat.image_url ? (
                  <img
                    src={cat.image_url}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                    <span className="text-6xl">{cat.icon || '📁'}</span>
                  </div>
                )}

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300" />
              </div>

              {/* Text Content */}
              <div className="p-4 space-y-2">
                <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                  {cat.name}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                  {cat.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  )
}
