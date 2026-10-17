import { isMac } from '@/hooks/useKeyboardShortcut'
import { cn } from '@/utils/cn'

// Visible shortcut badge -- "clear hints" means showing the actual key
// combo right on/next to the control it triggers (⌘K in a search box,
// Esc/↵ on a modal's Cancel/Confirm, ⌘Z/⌘⇧Z on Undo/Redo), not a separate
// help screen someone has to go find. Mirrors useKeyboardShortcut.js's own
// `combo` syntax ("mod+k", "shift+mod+z", "Escape") so the two never drift
// apart -- the badge always names the shortcut that's actually wired up.
const LABELS = {
  mod: isMac ? '⌘' : 'Ctrl', shift: isMac ? '⇧' : 'Shift', backspace: '⌫', delete: 'Del', escape: 'Esc', enter: '↵',
}

function labelFor(combo) {
  const parts = combo.toLowerCase().split('+')
  const rendered = parts.map((part) => LABELS[part] ?? (part.length === 1 ? part.toUpperCase() : part))
  // Mac convention stacks modifier glyphs with no separator (⌘⇧Z); every
  // other platform spells the combo out (Ctrl+Shift+Z) since "Ctrl" isn't
  // a single glyph people read the same way.
  return isMac ? rendered.join('') : rendered.join('+')
}

export function KeyHint({ combo, className }) {
  return (
    <kbd
      className={cn(
        'inline-flex items-center justify-center px-1.5 py-0.5 rounded-md border bg-muted font-mono text-[10px] font-medium text-muted-foreground leading-none',
        className,
      )}
    >
      {labelFor(combo)}
    </kbd>
  )
}
