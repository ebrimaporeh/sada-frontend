import { EMBED_LAYOUTS } from '../shared/embedLayouts'
import { mergeConfiguration } from './defaultConfiguration'

const inputClass = 'w-full px-3 py-2 rounded-lg border bg-background text-sm'

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground block mb-1">{label}</label>
      {children}
      {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
    </div>
  )
}

function ColorField({ label, value, placeholder, onChange }) {
  return (
    <Field label={label}>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value || placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="w-9 h-9 rounded-md border cursor-pointer"
        />
        <button
          type="button"
          onClick={() => onChange('')}
          className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-md border"
        >
          Reset
        </button>
      </div>
    </Field>
  )
}

// Content/appearance/layout only -- scoped to the spec's explicit field
// list, deliberately not exposing every low-level control an editor like
// this could theoretically have.
export function EmbedConfigForm({ embed, onLayoutChange, onConfigurationChange }) {
  const config = mergeConfiguration(embed.configuration)

  function setContent(patch) {
    onConfigurationChange({ ...config, content: { ...config.content, ...patch } })
  }
  function setAppearance(patch) {
    onConfigurationChange({ ...config, appearance: { ...config.appearance, ...patch } })
  }

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <p className="section-label">Layout</p>
        <div className="grid grid-cols-1 gap-2">
          {EMBED_LAYOUTS.map((l) => (
            <button
              key={l.value}
              type="button"
              onClick={() => onLayoutChange(l.value)}
              className={`text-left rounded-lg border p-2.5 transition-colors ${embed.layout === l.value ? 'border-primary bg-primary/5' : 'hover:bg-accent'}`}
            >
              <p className="text-sm font-medium">{l.label}</p>
              <p className="text-xs text-muted-foreground">{l.description}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <p className="section-label">Content</p>
        <Field label="Title" hint="Leave blank to use the destination's own title.">
          <input value={config.content.title} onChange={(e) => setContent({ title: e.target.value })} className={inputClass} />
        </Field>
        <Field label="Description" hint="Leave blank to use the destination's own description.">
          <textarea value={config.content.description} onChange={(e) => setContent({ description: e.target.value })} rows={2} className={inputClass} />
        </Field>
        <Field label="Donate button text">
          <input value={config.content.donateButtonText} onChange={(e) => setContent({ donateButtonText: e.target.value })} className={inputClass} />
        </Field>
      </section>

      <section className="space-y-3">
        <p className="section-label">Appearance</p>
        <div className="grid grid-cols-2 gap-3">
          <ColorField label="Button color" value={config.appearance.primaryColor} placeholder="#111111" onChange={(v) => setAppearance({ primaryColor: v })} />
          <ColorField label="Background" value={config.appearance.backgroundColor} placeholder="#ffffff" onChange={(v) => setAppearance({ backgroundColor: v })} />
          <ColorField label="Text color" value={config.appearance.textColor} placeholder="#111111" onChange={(v) => setAppearance({ textColor: v })} />
        </div>
        <Field label={`Corner radius (${config.appearance.borderRadius}px)`}>
          <input
            type="range" min={0} max={32} value={config.appearance.borderRadius}
            onChange={(e) => setAppearance({ borderRadius: Number(e.target.value) })} className="w-full"
          />
        </Field>
      </section>
    </div>
  )
}
