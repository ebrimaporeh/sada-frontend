import { cn } from '@/utils/cn'

// A labeled on/off switch with an explanatory description beneath the
// label -- the "toggle + description" shape used wherever a setting needs
// more context than a bare checkbox (e.g. show_in_embed on a campaign/
// organization). Originally private to CampaignForm.jsx (is_urgent);
// extracted here once a second caller needed the exact same shape.
// `activeClassName` lets a caller pick what "on" looks like -- CampaignForm
// keeps its red (urgent = alert), everything else defaults to the brand color.
export function Toggle({ checked, onChange, label, description, activeClassName = 'bg-primary' }) {
  return (
    <label className="flex items-start justify-between gap-4 cursor-pointer border rounded-xl p-4 bg-card">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative flex-shrink-0 w-10 h-6 rounded-full transition-colors focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2',
          checked ? activeClassName : 'bg-muted-foreground/30',
        )}
      >
        <span
          className={cn(
            'absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform',
            checked ? 'translate-x-4' : 'translate-x-0',
          )}
        />
      </button>
    </label>
  )
}
