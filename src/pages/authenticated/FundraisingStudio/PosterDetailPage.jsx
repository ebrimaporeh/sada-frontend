import { useEffect, useState } from 'react'
import { Link, useParams } from '@tanstack/react-router'
import { ChevronLeft } from 'lucide-react'
import { LoadingSpinner } from '@/components/custom/LoadingSpinner'
import { ROUTES } from '@/constants'
import { usePoster, useUpdatePoster } from '@/hooks/usePosters'
import { PosterEditor } from '@/features/fundraisingStudio/poster/PosterEditor'

export function PosterDetailPage() {
  const { id } = useParams({ strict: false })
  const { poster, isLoading } = usePoster(id)
  const updatePoster = useUpdatePoster()
  const [name, setName] = useState('')

  useEffect(() => {
    if (poster) setName(poster.name)
  }, [poster])

  if (isLoading) return <LoadingSpinner className="py-16" />
  if (!poster) return <p className="text-muted-foreground">Poster not found.</p>

  function handleBlur() {
    if (name && name !== poster.name) updatePoster.mutate({ id: poster.id, name })
  }

  return (
    <div>
      {/* Back button and title inline on one row (not stacked, each with
          their own margin) -- keeps the header compact so the toolbar/
          canvas below starts higher up the page. */}
      <div className="mb-3 flex items-center gap-2">
        <Link
          to={ROUTES.FUNDRAISING_POSTERS}
          title="Back to Posters"
          className="shrink-0 p-1.5 -ml-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={handleBlur}
          className="min-w-0 flex-1 text-lg font-bold tracking-tight bg-transparent border-none focus:outline-none focus:ring-0 px-0"
        />
        <p className="shrink-0 max-w-[40%] truncate text-sm text-muted-foreground">{poster.destination?.title}</p>
      </div>
      <PosterEditor poster={poster} />
    </div>
  )
}
