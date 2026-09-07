import { EMBED_LAYOUTS } from '../shared/embedLayouts'

// Extracted out of what's now EmbedConfigForm.jsx (Content/Appearance/
// After-donating) so Layout can sit in its own left sidebar column while
// the richer content/appearance/return-url fields get a wider column of
// their own to the right (see EmbedDetailPage.jsx) -- cramming all of it
// into one narrow sidebar left the rest of a wide screen unused.
export function EmbedLayoutPicker({ layout, onLayoutChange }) {
  return (
    <section className="space-y-3">
      <p className="section-label">Layout</p>
      <div className="grid grid-cols-1 gap-2">
        {EMBED_LAYOUTS.map((l) => (
          <button
            key={l.value}
            type="button"
            onClick={() => onLayoutChange(l.value)}
            className={`text-left rounded-lg border p-2.5 transition-colors ${layout === l.value ? 'border-primary bg-primary/5' : 'hover:bg-accent'}`}
          >
            <p className="text-sm font-medium">{l.label}</p>
            <p className="text-xs text-muted-foreground">{l.description}</p>
          </button>
        ))}
      </div>
    </section>
  )
}
