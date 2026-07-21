import { Link } from '@tanstack/react-router'
import { ArrowRight, Compass } from 'lucide-react'
import { useVisionTopics } from '@/hooks/useVision'
import { LoadingSpinner } from '@/components/custom/LoadingSpinner'
import { EmptyState } from '@/components/custom/EmptyState'
import { ROUTES } from '@/constants'

export function VisionIndexPage() {
  const { topics, isLoading } = useVisionTopics()

  return (
    <div>
      <div className="page-header">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <div className="section-label justify-center">
            <div className="section-label-line" />
            <span className="section-label-text">Roadmap</span>
            <div className="section-label-line" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Platform Vision</h1>
          <p className="text-muted-foreground">
            What's actually built today, and where each part of the platform is headed next —
            documented honestly, not as a pitch deck.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-14">
        {isLoading ? (
          <LoadingSpinner />
        ) : topics.length === 0 ? (
          <EmptyState icon={Compass} title="Nothing published yet" description="Check back soon." />
        ) : (
          <div className="space-y-3">
            {topics.map((topic) => (
              <Link
                key={topic.slug}
                to="/vision/$slug"
                params={{ slug: topic.slug }}
                className="group flex items-center justify-between gap-4 p-5 rounded-2xl border bg-card hover:border-primary/40 hover:shadow-sm transition-all"
              >
                <div className="min-w-0">
                  <h2 className="font-semibold group-hover:text-primary transition-colors">{topic.title}</h2>
                  {topic.summary && (
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{topic.summary}</p>
                  )}
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </Link>
            ))}
          </div>
        )}

        <div className="mt-12 flex flex-wrap gap-4 text-sm text-muted-foreground justify-center">
          <Link to={ROUTES.ABOUT} className="hover:text-foreground transition-colors">About the Platform</Link>
          <Link to={ROUTES.HELP} className="hover:text-foreground transition-colors">Help Center</Link>
        </div>
      </div>
    </div>
  )
}
