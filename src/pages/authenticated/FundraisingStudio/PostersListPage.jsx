import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Image, PlusCircle, Copy, Trash2, ExternalLink } from 'lucide-react'
import { PageHeader } from '@/components/custom/PageHeader'
import { EmptyState } from '@/components/custom/EmptyState'
import { LoadingSpinner } from '@/components/custom/LoadingSpinner'
import { ConfirmModal } from '@/components/custom/ConfirmModal'
import { ROUTES } from '@/constants'
import { usePosters, useDeletePoster, useDuplicatePoster } from '@/hooks/usePosters'

export function PostersListPage() {
  const { posters, isLoading } = usePosters()
  const duplicatePoster = useDuplicatePoster()
  const deletePoster = useDeletePoster()
  const [pendingDeleteId, setPendingDeleteId] = useState(null)

  if (isLoading) return <LoadingSpinner className="py-16" />

  return (
    <div>
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
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {posters.map((poster) => (
            <div key={poster.id} className="rounded-xl border bg-card overflow-hidden flex flex-col">
              <Link to={ROUTES.FUNDRAISING_POSTER_DETAIL} params={{ id: poster.id }} className="aspect-[4/5] bg-muted flex items-center justify-center">
                {poster.destination?.cover_image_url
                  ? <img src={poster.destination.cover_image_url} alt="" className="w-full h-full object-cover" />
                  : <Image className="w-8 h-8 text-muted-foreground" />}
              </Link>
              <div className="p-3 space-y-2">
                <div>
                  <p className="font-medium truncate">{poster.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{poster.destination?.title}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <Link
                    to={ROUTES.FUNDRAISING_POSTER_DETAIL}
                    params={{ id: poster.id }}
                    className="flex-1 text-center text-xs font-medium px-2 py-1.5 rounded-md border hover:bg-accent transition-colors"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    title="Duplicate"
                    onClick={() => duplicatePoster.mutate(poster.id)}
                    className="p-1.5 rounded-md border hover:bg-accent transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  {poster.share_url && (
                    <a
                      href={poster.share_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open share link"
                      className="p-1.5 rounded-md border hover:bg-accent transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <button
                    type="button"
                    title="Delete"
                    onClick={() => setPendingDeleteId(poster.id)}
                    className="p-1.5 rounded-md border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
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
