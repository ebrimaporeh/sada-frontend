import { cn } from '@/utils/cn'

// A single boolean switch. Two layouts:
//  - default: label (+ optional description) on the left, switch on the
//    right, full width -- a settings row.
//  - compact: switch first, label right after it, sized to sit inline in a
//    wrapped row of several toggles -- a permission-grant checklist.
export function Toggle({ checked, onChange, label, description, disabled, compact = false }) {
  const switchEl = (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative flex-shrink-0 rounded-full transition-colors focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed',
        compact ? 'w-8 h-5' : 'w-10 h-6',
        checked ? 'bg-primary' : 'bg-muted-foreground/30',
      )}
    >
      <span
        className={cn(
          'absolute top-1 left-1 rounded-full bg-white shadow-sm transition-transform',
          compact ? 'w-3 h-3' : 'w-4 h-4',
          checked ? (compact ? 'translate-x-3' : 'translate-x-4') : 'translate-x-0',
        )}
      />
    </button>
  )

  if (compact) {
    return (
      <label className={cn('inline-flex items-center gap-2 cursor-pointer select-none', disabled && 'opacity-60 cursor-not-allowed')}>
        {switchEl}
        <span className="text-xs font-medium">{label}</span>
      </label>
    )
  }

  return (
    <label className={cn('flex items-start justify-between gap-4 cursor-pointer group', disabled && 'opacity-60 cursor-not-allowed')}>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      {switchEl}
    </label>
  )
}
