import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ChevronLeft, Image, PlusCircle, Copy, Trash2, ExternalLink } from 'lucide-react'
import { PageHeader } from '@/components/custom/PageHeader'
import { EmptyState } from '@/components/custom/EmptyState'
import { LoadingSpinner } from '@/components/custom/LoadingSpinner'
import { ConfirmModal } from '@/components/custom/ConfirmModal'
import { ROUTES } from '@/constants'
import { usePosters, useDeletePoster, useDuplicatePoster } from '@/hooks/usePosters'
import { PosterThumbnail } from '@/features/fundraisingStudio/poster/PosterThumbnail'

export function PostersListPage() {
  const { posters, isLoading } = usePosters()
  const duplicatePoster = useDuplicatePoster()
  const deletePoster = useDeletePoster()
  const [pendingDeleteId, setPendingDeleteId] = useState(null)

  if (isLoading) return <LoadingSpinner className="py-16" />

  return (
    <div>
      <Link
        to={ROUTES.FUNDRAISING_STUDIO}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> Fundraising Studio
      </Link>
      <PageHeader
        title="Posters"
        action={
          <Link to={ROUTES.FUNDRAISING_POSTER_NEW} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
            <PlusCircle className="w-4 h-4" /> Create Poster
          </Link>
        }
      />

      {posters.length === 0 ? (
        <EmptyState
          icon={Image}
          title="Create your first fundraising poster"
          description="Turn your campaign or organization donation page into a poster you can share anywhere."
          action={
            <Link to={ROUTES.FUNDRAISING_POSTER_NEW} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
              <PlusCircle className="w-4 h-4" /> Create Poster
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {posters.map((poster) => (
            <div key={poster.id} className="rounded-lg border bg-card overflow-hidden flex flex-col">
              <Link to={ROUTES.FUNDRAISING_POSTER_DETAIL} params={{ id: poster.id }} className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
                {poster.design?.elements?.length
                  ? <PosterThumbnail design={poster.design} destination={poster.destination} />
                  : <Image className="w-6 h-6 text-muted-foreground" />}
              </Link>
              <div className="p-2 space-y-1.5">
                <div>
                  <p className="text-xs font-medium truncate">{poster.name}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{poster.destination?.title}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Link
                    to={ROUTES.FUNDRAISING_POSTER_DETAIL}
                    params={{ id: poster.id }}
                    className="flex-1 text-center text-[11px] font-medium px-2 py-1 rounded-md border hover:bg-accent transition-colors"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    title="Duplicate"
                    onClick={() => duplicatePoster.mutate(poster.id)}
                    className="p-1 rounded-md border hover:bg-accent transition-colors"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  {poster.share_url && (
                    <a
                      href={poster.share_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open share link"
                      className="p-1 rounded-md border hover:bg-accent transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  <button
                    type="button"
                    title="Delete"
                    onClick={() => setPendingDeleteId(poster.id)}
                    className="p-1 rounded-md border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(pendingDeleteId)}
        onClose={() => setPendingDeleteId(null)}
        onConfirm={() => deletePoster.mutate(pendingDeleteId, { onSuccess: () => setPendingDeleteId(null) })}
        title="Delete this poster?"
        description="This can't be undone. Its QR/share link will stop working."
        isLoading={deletePoster.isPending}
      />
    </div>
  )
}
