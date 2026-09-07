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

const HEX_COLOR_PATTERN = /^#[0-9a-f]{6}$/i

// Swatch (click to open the OS color picker) + a hex text field typed/pasted
// directly -- the native <input type="color"> alone only offers the OS
// picker, no way to enter a known hex value by hand. The swatch always
// needs a *valid* 6-digit hex to hand the browser (an in-progress typed
// value like "#f" would otherwise reset it to black), so it falls back to
// `placeholder` until `value` parses as one.
function ColorField({ label, value, placeholder, onChange }) {
  const swatchColor = HEX_COLOR_PATTERN.test(value) ? value : placeholder
  return (
    <Field label={label}>
      <div className="flex items-center gap-2">
        <label
          title="Pick a color"
          className="relative w-9 h-9 rounded-md border cursor-pointer overflow-hidden shrink-0"
          style={{ backgroundColor: swatchColor }}
        >
          <input
            type="color"
            value={swatchColor}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </label>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          spellCheck={false}
          className="min-w-0 flex-1 px-2 py-1.5 rounded-md border bg-background text-xs font-mono"
        />
        <button
          type="button"
          onClick={() => onChange('')}
          className="shrink-0 text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-md border"
        >
          Reset
        </button>
      </div>
    </Field>
  )
}

// Content/appearance/return-url only -- Layout lives in its own
// EmbedLayoutPicker (left sidebar column, see EmbedDetailPage.jsx). Scoped
// to the spec's explicit field list, deliberately not exposing every
// low-level control an editor like this could theoretically have.
export function EmbedConfigForm({ embed, onConfigurationChange, onReturnUrlChange }) {
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
        <div className="space-y-3">
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

      {onReturnUrlChange && (
        <section className="space-y-3">
          <p className="section-label">After donating</p>
          <Field
            label="Return visitors to *"
            hint="Required -- after donating, we send them back here instead of leaving them on Dolelma."
          >
            <input
              type="url"
              value={embed.return_url || ''}
              onChange={(e) => onReturnUrlChange(e.target.value)}
              placeholder="https://yoursite.com"
              required
              className={inputClass}
            />
          </Field>
        </section>
      )}
    </div>
  )
}
