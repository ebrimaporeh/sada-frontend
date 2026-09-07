import { Megaphone, Building2 } from 'lucide-react'
import { cn } from '@/utils/cn'

// Shared by Poster Studio's and Embed Studio's "create new" flow -- picking
// a destination is the one step both submodules genuinely share, per the
// architecture doc's "destination resolution" shared concern.
//
// `columns` lets callers fit this into a narrower rail (Poster Studio's
// side-by-side layout) without changing Embed Studio's wider single-column
// page, which still wants the 2-up grid.
export function DestinationPicker({ campaignDestinations, organizationDestinations, value, onChange, columns = 2 }) {
  const isEmpty = campaignDestinations.length === 0 && organizationDestinations.length === 0
  if (isEmpty) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        You don't have a campaign or organization you can create fundraising materials for yet.
      </p>
    )
  }

  const gridClass = cn('grid gap-3', columns === 1 ? 'grid-cols-1' : 'sm:grid-cols-2')

  return (
    <div className="space-y-6">
      {organizationDestinations.length > 0 && (
        <div>
          <p className="section-label mb-2">Organizations</p>
          <div className={gridClass}>
            {organizationDestinations.map((d) => (
              <DestinationCard key={`organization-${d.id}`} destination={d} icon={Building2}
                selected={value?.type === 'organization' && value?.id === d.id}
                onClick={() => onChange(d)} />
            ))}
          </div>
        </div>
      )}
      {campaignDestinations.length > 0 && (
        <div>
          <p className="section-label mb-2">Campaigns</p>
          <div className={gridClass}>
            {campaignDestinations.map((d) => (
              <DestinationCard key={`campaign-${d.id}`} destination={d} icon={Megaphone}
                selected={value?.type === 'campaign' && value?.id === d.id}
                onClick={() => onChange(d)} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function DestinationCard({ destination, icon: Icon, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg border text-left transition-colors',
        selected ? 'border-primary bg-primary/5' : 'hover:bg-accent',
      )}
    >
      <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center shrink-0 overflow-hidden">
        {destination.coverImageUrl
          ? <img src={destination.coverImageUrl} alt="" className="w-full h-full object-cover" />
          : <Icon className="w-5 h-5 text-muted-foreground" />}
      </div>
      <div className="min-w-0">
        <p className="font-medium truncate">{destination.title}</p>
        <p className="text-xs text-muted-foreground truncate">{destination.subtitle}</p>
      </div>
    </button>
  )
}
