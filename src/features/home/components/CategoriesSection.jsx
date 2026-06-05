import { Link } from '@tanstack/react-router'
import { useCategories } from '@/hooks/useCampaigns'
import { ROUTES } from '@/constants'

export function CategoriesSection() {
  const { categories } = useCategories()

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold">What are you fundraising for?</h2>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">
          Browse campaigns by category or start your own today
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            to={ROUTES.CAMPAIGNS}
            search={{ category: cat.slug }}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border bg-card hover:border-primary hover:shadow-sm hover:-translate-y-0.5 transition-all text-center group"
          >
            <span className="text-2xl">{cat.icon}</span>
            <span className="text-sm font-medium group-hover:text-primary transition-colors">{cat.name}</span>
            <span className="text-xs text-muted-foreground">{cat.count} campaigns</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
