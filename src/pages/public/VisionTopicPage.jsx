import { Link, useParams } from '@tanstack/react-router'
import { MapPin, Wrench, Sprout, Telescope } from 'lucide-react'
import { useVisionTopic } from '@/hooks/useVision'
import { MarkdownContent } from '@/components/custom/MarkdownEditor'
import { LoadingSpinner } from '@/components/custom/LoadingSpinner'
import { EmptyState } from '@/components/custom/EmptyState'
import { Breadcrumbs } from '@/components/custom/Breadcrumbs'
import { usePageMeta } from '@/hooks/usePageMeta'
import { ROUTES } from '@/constants'

const PHASES = [
  { key: 'current_state', label: 'Current State', icon: MapPin, description: "What's actually built and working today." },
  { key: 'implementation', label: 'Implementation', icon: Wrench, description: 'How it works underneath, in a little technical detail.' },
  { key: 'short_term_vision', label: 'Short-Term Vision', icon: Sprout, description: "What's being built next." },
  { key: 'long_term_vision', label: 'Long-Term Vision', icon: Telescope, description: 'Where this is ultimately headed.' },
]

export function VisionTopicPage() {
  const { slug } = useParams({ strict: false })
  const { topic, isLoading, isError } = useVisionTopic(slug)

  // Must run on every render, including the loading/not-found ones below --
  // a hook called only on the success path breaks React's Rules of Hooks
  // the moment this component re-renders after data loads.
  usePageMeta({
    title: topic?.title,
    description: topic?.summary || topic?.current_state,
    type: 'article',
  })

  if (isLoading) return <LoadingSpinner className="py-32" />

  if (isError || !topic) {
    return (
      <EmptyState
        title="Not found"
        description="This topic doesn't exist or hasn't been published yet."
        action={
          <Link to={ROUTES.VISION} className="text-sm text-primary hover:underline">
            Back to Platform Vision
          </Link>
        }
      />
    )
  }

  const phasesWithContent = PHASES.filter((phase) => topic[phase.key]?.trim())

  return (
    <div>
      <div className="page-header">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <Breadcrumbs items={[{ label: 'Platform Vision', to: ROUTES.VISION }]} current={topic.title} />
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">{topic.title}</h1>
          {topic.summary && <p className="text-muted-foreground">{topic.summary}</p>}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-14 space-y-8">
        {phasesWithContent.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center">Documentation for this topic is still being written.</p>
        ) : (
          phasesWithContent.map(({ key, label, icon: Icon, description }) => (
            <div key={key} className="bg-card border rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b flex items-start gap-3 bg-muted/30">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4.5 h-4.5 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold">{label}</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
                </div>
              </div>
              <div className="p-6 sm:p-8">
                <MarkdownContent content={topic[key]} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
