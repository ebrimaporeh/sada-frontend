import { Link } from '@tanstack/react-router'
import { MapPin, Users, Clock } from 'lucide-react'
import { ProgressBar } from '@/components/custom/ProgressBar'
import { formatGMD, progressPercent, daysLeft } from '@/utils/formatters'
import { cn } from '@/utils/cn'

export function CampaignCard({ campaign, className }) {
  const pct = progressPercent(campaign.raised, campaign.goal)
  const days = daysLeft(campaign.deadline)
  const isAlmostDone = days <= 7 && days > 0
  const isGoalMet = pct >= 100

  return (
    <Link
      to="/campaigns/$slug"
      params={{ slug: campaign.slug }}
      className={cn(
        'block bg-card rounded-xl border hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden group',
        className,
      )}
    >
      {/* Image area */}
      <div className={cn('relative h-44 bg-gradient-to-br', campaign.gradient || 'from-primary/60 to-primary')}>
        {/* Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
          <span className="inline-flex items-center gap-1 bg-black/40 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded-full">
            {campaign.category?.name ?? campaign.category}
          </span>
          <div className="flex flex-col items-end gap-1">
            {campaign.is_urgent && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                URGENT
              </span>
            )}
            {isGoalMet && (
              <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                FUNDED ✓
              </span>
            )}
          </div>
        </div>

        {/* Region */}
        <div className="absolute bottom-3 left-3">
          <span className="inline-flex items-center gap-1 bg-black/40 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
            <MapPin className="w-3 h-3" />
            {campaign.region}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <h3 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {campaign.title}
        </h3>

        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {campaign.short_description}
        </p>

        <ProgressBar value={campaign.raised} max={campaign.goal} />

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-primary">{formatGMD(campaign.raised)}</p>
            <p className="text-xs text-muted-foreground">of {formatGMD(campaign.goal)} goal</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold">{pct}%</p>
            <p className="text-xs text-muted-foreground">funded</p>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t">
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {campaign.donors_count.toLocaleString()} donors
          </span>
          <span className={cn('flex items-center gap-1', isAlmostDone && 'text-donate font-medium')}>
            <Clock className="w-3 h-3" />
            {days === 0 ? 'Ended' : `${days} days left`}
          </span>
        </div>
      </div>
    </Link>
  )
}
