import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '@/utils/cn'

/**
 * Drop-in replacement for a native `<select>`. Fires `onChange` with the
 * same `{ target: { value } }` shape a native select's change event has,
 * so existing `onChange={set('field')}`-style handlers keep working.
 *
 * `options` is `[{ value, label, icon? }]` — `icon` is an optional
 * already-resolved component (e.g. a lucide-react icon or the result of a
 * lookup like `getCategoryIcon(cat.icon)`), rendered next to the label.
 * Passing an icon here is how you show a real icon glyph — a native
 * `<option>` can only ever render plain text, which is why "category icon
 * name" (e.g. "Stethoscope Medical") used to leak into option text instead
 * of ever becoming a real icon.
 */
export function Select({
  value, onChange, options, placeholder = 'Select…', disabled, className, buttonClassName,
}) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    if (!open) return
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false)
    }
    function handleEscape(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  const selected = options.find((o) => o.value === value)

  function handleSelect(option) {
    onChange?.({ target: { value: option.value } })
    setOpen(false)
  }

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'w-full flex items-center gap-2 px-3 py-2.5 border rounded-lg text-sm bg-background text-left focus:outline-hidden focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed',
          !selected && 'text-muted-foreground',
          buttonClassName,
        )}
      >
        {selected?.icon && <selected.icon className="w-4 h-4 flex-shrink-0 text-muted-foreground" />}
        <span className="flex-1 truncate">{selected ? selected.label : placeholder}</span>
        <ChevronDown className={cn('w-4 h-4 flex-shrink-0 text-muted-foreground transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full max-h-64 overflow-y-auto bg-card border rounded-xl shadow-lg py-1">
          {options.length === 0 ? (
            <p className="px-3 py-2 text-sm text-muted-foreground">No options</p>
          ) : (
            options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option)}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-accent transition-colors',
                  option.value === value && 'bg-primary/5 text-primary font-medium',
                )}
              >
                {option.icon && <option.icon className="w-4 h-4 flex-shrink-0" />}
                <span className="flex-1 truncate">{option.label}</span>
                {option.value === value && <Check className="w-4 h-4 flex-shrink-0" />}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
