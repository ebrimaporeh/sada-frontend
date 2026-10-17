import { Link } from '@tanstack/react-router'
import { Image, Code2, ArrowRight, PlusCircle } from 'lucide-react'
import { ROUTES } from '@/constants'
import { usePosters } from '@/hooks/usePosters'
import { useOrganizationEmbed } from '@/hooks/useEmbeds'
import { useFundraisingDestinations } from '@/features/fundraisingStudio/shared/useFundraisingDestinations'
import { EMBED_LAYOUTS } from '@/features/fundraisingStudio/shared/embedLayouts'
import { PosterThumbnail } from '@/features/fundraisingStudio/poster/PosterThumbnail'
import { cn } from '@/utils/cn'

// The hub's job is to actually show what's there, not stand in for it with
// a generic icon + description -- Posters get a strip of their own real
// thumbnails (same PosterThumbnail component the editor/list use, so
// there's exactly one place poster rendering can drift), and the
// single-organization case (the common one -- see EmbedsListPage.jsx's own
// auto-redirect for the same reasoning) shows its actual embed's live
// status instead of a static blurb. Multi-organization embeds fall back to
// a plain summary card -- rendering N real widget previews here would be a
// second feature, not a hub redesign.
export function FundraisingStudioHomePage() {
  const { posters, count: posterCount, isLoading: postersLoading } = usePosters()
  const { organizationDestinations, isLoading: destinationsLoading } = useFundraisingDestinations()

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Design Studio</h1>
        <p className="text-muted-foreground mt-1">
          Turn a campaign or organization donation page into a poster you can share, or a widget you can embed on your website.
        </p>
      </div>
      <div className="grid lg:grid-cols-2 gap-5">
        <PosterSection posters={posters} count={posterCount} isLoading={postersLoading} />
        <EmbedSection organizations={organizationDestinations} isLoading={destinationsLoading} />
      </div>
    </div>
  )
}

function SectionCard({ icon: Icon, title, description, to, params, children }) {
  return (
    <div className="rounded-xl border bg-card p-5 flex flex-col gap-4">
      <Link to={to} params={params} className="group flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold group-hover:text-primary transition-colors">{title}</p>
            <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
          </div>
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform shrink-0 mt-1" />
      </Link>
      {children}
    </div>
  )
}

function PosterSection({ posters, count, isLoading }) {
  const recent = posters.slice(0, 4)
  return (
    <SectionCard
      to={ROUTES.FUNDRAISING_POSTERS}
      icon={Image}
      title="Poster Studio"
      description="Design downloadable, shareable fundraising posters."
    >
      {isLoading ? (
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="aspect-square rounded-lg bg-muted animate-pulse" />)}
        </div>
      ) : recent.length === 0 ? (
        <EmptyPrompt
          text="No posters yet"
          actionLabel="Create your first poster"
          to={ROUTES.FUNDRAISING_POSTER_NEW}
        />
      ) : (
        <>
          <div className="grid grid-cols-4 gap-2">
            {recent.map((poster) => (
              <Link
                key={poster.id}
                to={ROUTES.FUNDRAISING_POSTER_DETAIL}
                params={{ id: poster.id }}
                title={poster.name}
                className="aspect-square rounded-lg border bg-muted overflow-hidden hover:border-primary/50 transition-colors"
              >
                {poster.design?.elements?.length
                  ? <PosterThumbnail design={poster.design} destination={poster.destination} />
                  : <div className="w-full h-full flex items-center justify-center"><Image className="w-4 h-4 text-muted-foreground" /></div>}
              </Link>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            {count} poster{count === 1 ? '' : 's'}
            {count > recent.length && <Link to={ROUTES.FUNDRAISING_POSTERS} className="ml-1.5 text-primary hover:underline">View all</Link>}
          </p>
        </>
      )}
    </SectionCard>
  )
}

function EmbedSection({ organizations, isLoading }) {
  if (isLoading) {
    return (
      <SectionCard to={ROUTES.FUNDRAISING_EMBEDS} icon={Code2} title="Embed Studio" description="Design and install your organization's one donation widget.">
        <div className="h-16 rounded-lg bg-muted animate-pulse" />
      </SectionCard>
    )
  }

  if (organizations.length === 0) {
    return (
      <SectionCard to={ROUTES.FUNDRAISING_EMBEDS} icon={Code2} title="Embed Studio" description="Design and install your organization's one donation widget.">
        <EmptyPrompt text="No organization to manage fundraising materials for yet" />
      </SectionCard>
    )
  }

  if (organizations.length > 1) {
    return (
      <SectionCard to={ROUTES.FUNDRAISING_EMBEDS} icon={Code2} title="Embed Studio" description="Design and install your organization's one donation widget.">
        <p className="text-sm text-muted-foreground">
          {organizations.length} organizations, each with their own embed --{' '}
          <Link to={ROUTES.FUNDRAISING_EMBEDS} className="text-primary hover:underline">manage them</Link>.
        </p>
      </SectionCard>
    )
  }

  return <SingleOrganizationEmbedSection organization={organizations[0]} />
}

function SingleOrganizationEmbedSection({ organization }) {
  const { embed, isLoading } = useOrganizationEmbed(organization.id)
  const layoutLabel = EMBED_LAYOUTS.find((l) => l.value === embed?.layout)?.label ?? embed?.layout

  return (
    <SectionCard
      to={ROUTES.FUNDRAISING_EMBED_DETAIL}
      params={{ organizationId: organization.id }}
      icon={Code2}
      title="Embed Studio"
      description="Design and install your organization's one donation widget."
    >
      {isLoading || !embed ? (
        <div className="h-16 rounded-lg bg-muted animate-pulse" />
      ) : (
        <Link
          to={ROUTES.FUNDRAISING_EMBED_DETAIL}
          params={{ organizationId: organization.id }}
          className="flex items-center justify-between gap-3 p-3 rounded-lg border hover:border-primary/50 transition-colors"
        >
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{embed.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {layoutLabel} layout &middot; {embed.destinations?.length ?? 0} destination{embed.destinations?.length === 1 ? '' : 's'} shown
            </p>
          </div>
          <span className={cn(
            'shrink-0 inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full',
            embed.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-muted text-muted-foreground',
          )}
          >
            <span className={cn('w-1.5 h-1.5 rounded-full', embed.is_active ? 'bg-emerald-500' : 'bg-muted-foreground/50')} />
            {embed.is_active ? 'Active' : 'Inactive'}
          </span>
        </Link>
      )}
    </SectionCard>
  )
}

function EmptyPrompt({ text, actionLabel, to }) {
  return (
    <div className="flex items-center justify-between gap-3 p-3 rounded-lg border border-dashed">
      <p className="text-sm text-muted-foreground">{text}</p>
      {actionLabel && to && (
        <Link to={to} className="shrink-0 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline">
          <PlusCircle className="w-3.5 h-3.5" /> {actionLabel}
        </Link>
      )}
    </div>
  )
}
