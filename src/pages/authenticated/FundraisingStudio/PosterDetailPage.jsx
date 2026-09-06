import { useEffect, useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { LoadingSpinner } from '@/components/custom/LoadingSpinner'
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
      <div className="mb-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={handleBlur}
          className="text-xl font-bold tracking-tight bg-transparent border-none focus:outline-none focus:ring-0 px-0 w-full"
        />
        <p className="text-sm text-muted-foreground">{poster.destination?.title}</p>
      </div>
      <PosterEditor poster={poster} />
    </div>
  )
}
