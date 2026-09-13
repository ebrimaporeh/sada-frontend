import { Select } from '@/components/custom/Select'
import { mergeConfiguration } from './defaultConfiguration'
import { FONT_OPTIONS } from './fontOptions'
import { inputClass, Field, ColorField } from './configFormFields'

// Content/appearance only -- Layout lives in its own EmbedLayoutPicker
// (left sidebar column, see EmbedDetailPage.jsx). Scoped to the spec's
// explicit field list, deliberately not exposing every low-level control
// an editor like this could theoretically have.
//
// This is "step 1" of the Studio editor -- the card's own design.
// DonationFlowConfigForm.jsx ("step 2") styles what opens on Donate click
// (and owns the return-url field, since that's about what happens once the
// donation flow finishes, not the card), deliberately independent of
// everything here -- see its own docstring.
export function EmbedConfigForm({ embed, onConfigurationChange }) {
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
        <p className="section-label">Card appearance</p>
        <div className="space-y-3">
          <ColorField label="Button color" value={config.appearance.buttonColor} placeholder="#111111" onChange={(v) => setAppearance({ buttonColor: v })} />
          <ColorField label="Background" value={config.appearance.backgroundColor} placeholder="#ffffff" onChange={(v) => setAppearance({ backgroundColor: v })} />
          <ColorField label="Text color" value={config.appearance.textColor} placeholder="#111111" onChange={(v) => setAppearance({ textColor: v })} />
        </div>
        <Field label={`Card corner radius (${config.appearance.borderRadius}px)`}>
          <input
            type="range" min={0} max={32} value={config.appearance.borderRadius}
            onChange={(e) => setAppearance({ borderRadius: Number(e.target.value) })} className="w-full"
          />
        </Field>
        <Field label={`Button corner radius (${config.appearance.buttonRadius}px)`}>
          <input
            type="range" min={0} max={32} value={config.appearance.buttonRadius}
            onChange={(e) => setAppearance({ buttonRadius: Number(e.target.value) })} className="w-full"
          />
        </Field>
        <Field label="Font family" hint="A curated set of web-safe fonts, loaded securely -- not a free-text field.">
          <Select
            value={config.appearance.fontFamily}
            onChange={(e) => setAppearance({ fontFamily: e.target.value })}
            options={FONT_OPTIONS.map((f) => ({ value: f.value, label: f.label }))}
          />
        </Field>
      </section>
    </div>
  )
}
