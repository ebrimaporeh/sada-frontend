import { Link } from '@tanstack/react-router'
import { Image, Code2, ArrowRight } from 'lucide-react'
import { PageHeader } from '@/components/custom/PageHeader'
import { ROUTES } from '@/constants'
import { usePosters } from '@/hooks/usePosters'
import { useEmbeds } from '@/hooks/useEmbeds'

export function FundraisingStudioHomePage() {
  const { count: posterCount } = usePosters()
  const { count: embedCount } = useEmbeds()

  return (
    <div>
      <PageHeader
        title="Fundraising Studio"
        description="Turn a campaign or organization donation page into a poster you can share, or a widget you can embed on your website."
      />
      <div className="grid sm:grid-cols-2 gap-4">
        <StudioCard
          to={ROUTES.FUNDRAISING_POSTERS}
          icon={Image}
          title="Poster Studio"
          description="Design downloadable, shareable fundraising posters."
          count={posterCount}
          countLabel="poster"
        />
        <StudioCard
          to={ROUTES.FUNDRAISING_EMBEDS}
          icon={Code2}
          title="Embed Studio"
          description="Configure a donation widget for an external website."
          count={embedCount}
          countLabel="embed"
        />
      </div>
    </div>
  )
}

function StudioCard({ to, icon: Icon, title, description, count, countLabel }) {
  return (
    <Link to={to} className="group flex flex-col gap-3 p-5 rounded-xl border bg-card hover:border-primary/50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
      </div>
      <div>
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
      </div>
      <p className="text-xs text-muted-foreground">
        {count > 0 ? `${count} ${countLabel}${count === 1 ? '' : 's'}` : `No ${countLabel}s yet`}
      </p>
    </Link>
  )
}
