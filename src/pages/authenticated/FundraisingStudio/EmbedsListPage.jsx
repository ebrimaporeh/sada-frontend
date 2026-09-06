import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Code2, PlusCircle, Copy, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/custom/PageHeader'
import { EmptyState } from '@/components/custom/EmptyState'
import { LoadingSpinner } from '@/components/custom/LoadingSpinner'
import { ConfirmModal } from '@/components/custom/ConfirmModal'
import { cn } from '@/utils/cn'
import { ROUTES } from '@/constants'
import { useEmbeds, useDeleteEmbed, useDuplicateEmbed, useSetEmbedActive } from '@/hooks/useEmbeds'

export function EmbedsListPage() {
  const { embeds, isLoading } = useEmbeds()
  const duplicateEmbed = useDuplicateEmbed()
  const deleteEmbed = useDeleteEmbed()
  const setActive = useSetEmbedActive()
  const [pendingDeleteId, setPendingDeleteId] = useState(null)

  if (isLoading) return <LoadingSpinner className="py-16" />

  return (
    <div>
      <PageHeader
        title="Embeds"
        action={
          <Link to={ROUTES.FUNDRAISING_EMBED_NEW} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
            <PlusCircle className="w-4 h-4" /> Create Embed
          </Link>
        }
      />

      {embeds.length === 0 ? (
        <EmptyState
          icon={Code2}
          title="Bring your fundraising to your website"
          description="Create a donation widget and embed it on your organization's website."
          action={
            <Link to={ROUTES.FUNDRAISING_EMBED_NEW} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
              <PlusCircle className="w-4 h-4" /> Create Embed
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {embeds.map((embed) => (
            <div key={embed.id} className="flex items-center gap-4 p-4 rounded-xl border bg-card">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <Code2 className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium truncate">{embed.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {embed.destination?.title} &middot; {embed.layout.replace('_', ' ')}
                </p>
              </div>
              <span className={cn(
                'text-xs px-2 py-0.5 rounded-full font-medium shrink-0',
                embed.is_active ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground',
              )}>
                {embed.is_active ? 'Active' : 'Inactive'}
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setActive.mutate({ id: embed.id, isActive: !embed.is_active })}
                  className="text-xs font-medium px-2.5 py-1.5 rounded-md border hover:bg-accent transition-colors"
                >
                  {embed.is_active ? 'Deactivate' : 'Activate'}
                </button>
                <Link
                  to={ROUTES.FUNDRAISING_EMBED_DETAIL}
                  params={{ id: embed.id }}
                  className="text-xs font-medium px-2.5 py-1.5 rounded-md border hover:bg-accent transition-colors"
                >
                  Configure
                </Link>
                <button
                  type="button"
                  title="Duplicate"
                  onClick={() => duplicateEmbed.mutate(embed.id)}
                  className="p-1.5 rounded-md border hover:bg-accent transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  title="Delete"
                  onClick={() => setPendingDeleteId(embed.id)}
                  className="p-1.5 rounded-md border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(pendingDeleteId)}
        onClose={() => setPendingDeleteId(null)}
        onConfirm={() => deleteEmbed.mutate(pendingDeleteId, { onSuccess: () => setPendingDeleteId(null) })}
        title="Delete this embed?"
        description="Any website with this embed installed will stop showing it."
        isLoading={deleteEmbed.isPending}
      />
    </div>
  )
}
