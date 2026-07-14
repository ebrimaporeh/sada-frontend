import { Link } from '@tanstack/react-router'
import { Megaphone } from 'lucide-react'
import { VerifiedTick } from '@/components/custom/VerifiedTick'
import { formatGMD, initials } from '@/utils/formatters'
import { GAMBIA_REGIONS } from '@/constants'
import { cn } from '@/utils/cn'

export function CampaignerCard({ campaigner, className }) {
  const regionLabel = GAMBIA_REGIONS.find((r) => r.value === campaigner.region)?.label

  return (
    <Link
      to="/campaigners/$id"
      params={{ id: campaigner.id }}
      className={cn(
        'block bg-card rounded-xl border p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-center',
        className,
      )}
    >
      <div className="w-16 h-16 rounded-full bg-primary mx-auto flex items-center justify-center text-primary-foreground text-lg font-bold overflow-hidden">
        {campaigner.avatar
          ? <img src={campaigner.avatar} alt={campaigner.full_name} className="w-full h-full object-cover" />
          : initials(campaigner.full_name)
        }
      </div>

      <div className="mt-3 flex items-center justify-center gap-1">
        <p className="font-semibold text-sm truncate">{campaigner.full_name}</p>
        {campaigner.is_verified && <VerifiedTick />}
      </div>
      {regionLabel && <p className="text-xs text-muted-foreground">{regionLabel}</p>}

      {campaigner.bio && (
        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{campaigner.bio}</p>
      )}

      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground mt-4 pt-3 border-t">
        <span className="flex items-center gap-1">
          <Megaphone className="w-3 h-3" />
          {campaigner.campaign_count} campaign{campaigner.campaign_count !== 1 ? 's' : ''}
        </span>
        {campaigner.total_raised != null && (
          <span className="font-medium text-foreground">{formatGMD(campaigner.total_raised)} raised</span>
        )}
      </div>
    </Link>
  )
}
