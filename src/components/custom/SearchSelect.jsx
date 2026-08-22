import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, Check, Search } from 'lucide-react'
import { cn } from '@/utils/cn'

/**
 * Same contract as Select (drop-in for a native `<select>`, fires
 * `onChange` as `{ target: { value } }`), but opens with a search input
 * that filters `options` by label — for lists long enough that scanning
 * them beats scrolling. See Select.jsx for the `options` shape.
 */
export function SearchSelect({
  value, onChange, options, placeholder = 'Select…', searchPlaceholder = 'Search…',
  disabled, className, buttonClassName, emptyMessage = 'No matches',
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const containerRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (!open) return
    setQuery('')
    const focusTimer = setTimeout(() => inputRef.current?.focus(), 0)
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false)
    }
    function handleEscape(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      clearTimeout(focusTimer)
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  const selected = options.find((o) => o.value === value)
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options
    return options.filter((o) => o.label.toLowerCase().includes(q))
  }, [options, query])

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
        <div className="absolute z-50 mt-1 w-full bg-card border rounded-xl shadow-lg overflow-hidden">
          <div className="relative border-b">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-3 py-2.5 text-sm bg-transparent focus:outline-hidden"
            />
          </div>
          <div className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <p className="px-3 py-2 text-sm text-muted-foreground">{emptyMessage}</p>
            ) : (
              filtered.map((option) => (
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
        </div>
      )}
    </div>
  )
}
