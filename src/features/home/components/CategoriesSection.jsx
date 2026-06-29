import { Link } from '@tanstack/react-router'
import { useCategories } from '@/hooks/useCampaigns'
import { ROUTES } from '@/constants'

export function CategoriesSection() {
  const { categories } = useCategories()

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

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={ROUTES.CAMPAIGNS}
              search={{ category: cat.slug }}
              className="group flex flex-col items-center justify-center p-6 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-md transition-all text-center gap-2"
            >
              <span className="text-5xl group-hover:scale-110 transition-transform">{cat.icon}</span>
              <div>
                <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-muted-foreground">{cat.count}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
