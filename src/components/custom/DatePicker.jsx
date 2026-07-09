import { useEffect, useRef, useState } from 'react'
import { CalendarDays } from 'lucide-react'
import { Calendar } from './Calendar'
import { cn } from '@/utils/cn'

function toDate(value) {
  if (!value) return undefined
  if (value instanceof Date) return value
  // 'YYYY-MM-DD' parsed as local time, not UTC (new Date('YYYY-MM-DD') is UTC
  // midnight, which can display as the previous day in western timezones).
  const [y, m, d] = value.split('-').map(Number)
  if (!y || !m || !d) return undefined
  return new Date(y, m - 1, d)
}

function toISODate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const displayFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

/**
 * Drop-in replacement for `<input type="date">`. Fires `onChange` with the
 * same `{ target: { value: 'YYYY-MM-DD' } }` shape a native date input event
 * has, so existing `onChange={set('field')}`-style handlers keep working.
 */
export function DatePicker({ value, onChange, min, max, placeholder = 'Select date', disabled, className }) {
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

  const selectedDate = toDate(value)
  const minDate = toDate(min)
  const maxDate = toDate(max)
  const disabledMatcher = minDate || maxDate
    ? { ...(minDate && { before: minDate }), ...(maxDate && { after: maxDate }) }
    : undefined

  function handleSelect(date) {
    if (!date) return
    onChange?.({ target: { value: toISODate(date), type: 'date' } })
    setOpen(false)
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'w-full flex items-center gap-2 px-3 py-2.5 border rounded-lg text-sm bg-background text-left focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed',
          !selectedDate && 'text-muted-foreground',
          className,
        )}
      >
        <CalendarDays className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
        <span className="truncate">{selectedDate ? displayFormat.format(selectedDate) : placeholder}</span>
      </button>

      {open && (
        <div className="absolute z-50 mt-2 bg-card border rounded-xl shadow-lg">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleSelect}
            defaultMonth={selectedDate}
            disabled={disabledMatcher}
          />
        </div>
      )}
    </div>
  )
}
