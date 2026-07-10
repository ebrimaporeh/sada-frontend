import { DayPicker } from 'react-day-picker'
import { cn } from '@/utils/cn'

/**
 * Tailwind-styled wrapper around react-day-picker. No default stylesheet is
 * imported — every part is styled here via `classNames` so it matches the
 * app's semantic tokens instead of react-day-picker's own look.
 *
 * Nav (prev/next) and the month/year caption are rendered as separate DOM
 * siblings by react-day-picker (nav isn't nested inside the caption), so they
 * live in their own stacked rows here rather than being overlaid with
 * `absolute` positioning — that overlay approach silently ate clicks on both
 * the nav buttons and the caption underneath it.
 */
export function Calendar({ className, captionLayout = 'dropdown', ...props }) {
  return (
    <DayPicker
      showOutsideDays
      captionLayout={captionLayout}
      className={cn('p-3', className)}
      classNames={{
        months: 'flex flex-col sm:flex-row gap-4',
        month: 'space-y-1',
        nav: 'flex items-center justify-between mb-1',
        button_previous: 'p-1.5 rounded-lg hover:bg-accent transition-colors disabled:opacity-30 disabled:pointer-events-none',
        button_next: 'p-1.5 rounded-lg hover:bg-accent transition-colors disabled:opacity-30 disabled:pointer-events-none',
        chevron: 'w-4 h-4 fill-foreground',
        month_caption: 'flex items-center justify-center h-9 mb-1',
        caption_label: 'flex items-center gap-1 text-sm font-semibold px-2 py-1 rounded-md pointer-events-none',
        dropdowns: 'flex items-center gap-1.5',
        dropdown_root: 'relative inline-flex items-center rounded-md hover:bg-accent transition-colors',
        dropdown: 'absolute inset-0 opacity-0 cursor-pointer text-sm',
        month_grid: 'w-full border-collapse mt-1',
        weekdays: 'flex',
        weekday: 'text-muted-foreground text-xs font-medium w-9 h-9 flex items-center justify-center',
        week: 'flex w-full',
        // `day` is the <td>; `day_button` is its direct child <button>. Modifier
        // keys below (selected/range_*/today/...) get appended onto the <td>'s
        // className by react-day-picker, so they target the button via `[&>button]`.
        day: 'w-9 h-9 p-0 text-center text-sm',
        day_button: 'w-9 h-9 rounded-md font-normal transition-colors hover:bg-accent',
        selected: '[&>button]:bg-primary [&>button]:text-primary-foreground hover:[&>button]:bg-primary/90',
        range_start: 'rounded-l-md [&>button]:bg-primary [&>button]:text-primary-foreground hover:[&>button]:bg-primary/90',
        range_end: 'rounded-r-md [&>button]:bg-primary [&>button]:text-primary-foreground hover:[&>button]:bg-primary/90',
        range_middle: '[&>button]:bg-primary/15 [&>button]:text-foreground [&>button]:rounded-none hover:[&>button]:bg-primary/25',
        today: '[&>button]:border [&>button]:border-primary',
        outside: 'text-muted-foreground/40',
        disabled: 'text-muted-foreground/30 pointer-events-none',
        hidden: 'invisible',
      }}
      {...props}
    />
  )
}
