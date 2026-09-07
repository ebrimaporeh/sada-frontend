import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { EMBED_LAYOUTS } from '../shared/embedLayouts'
import { cn } from '@/utils/cn'

// Compact mobile/tablet alternative to EmbedLayoutPicker's vertical card
// list -- five cards each with a label *and* description can run 400+px
// tall stacked on a narrow screen, pushing the preview and every other
// control down below a scroll before a visitor sees any of it. A single
// row keeps that space back while still making the current selection
// obvious -- it's shown right on the closed trigger (label + description),
// not just a subtle border/color cue -- same dropdown convention as
// ProfileSwitcher.jsx (button trigger, outside-click closes, Check marks
// the active row).
export function EmbedLayoutDropdown({ layout, onLayoutChange }) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)
  const active = EMBED_LAYOUTS.find((l) => l.value === layout) ?? EMBED_LAYOUTS[0]

  useEffect(() => {
    if (!open) return
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-3 px-3.5 py-3 rounded-xl border bg-card text-left hover:bg-accent transition-colors"
      >
        <span className="min-w-0">
          <span className="text-[11px] font-medium text-muted-foreground block">Layout</span>
          <span className="text-sm font-semibold block truncate">{active.label}</span>
        </span>
        <ChevronDown className={cn('w-4 h-4 text-muted-foreground shrink-0 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute left-0 right-0 mt-1 z-20 bg-card border rounded-xl shadow-lg py-1 max-h-80 overflow-y-auto">
          {EMBED_LAYOUTS.map((l) => (
            <button
              key={l.value}
              type="button"
              onClick={() => { onLayoutChange(l.value); setOpen(false) }}
              className={cn(
                'w-full flex items-start justify-between gap-2 px-3.5 py-2.5 text-left hover:bg-accent transition-colors',
                layout === l.value && 'bg-primary/5',
              )}
            >
              <span className="min-w-0">
                <span className="text-sm font-medium block">{l.label}</span>
                <span className="text-xs text-muted-foreground block">{l.description}</span>
              </span>
              {layout === l.value && <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
