import { Select } from '@/components/custom/Select'
import { mergeConfiguration } from './defaultConfiguration'
import { FONT_OPTIONS } from './fontOptions'
import { inputClass, Field, ColorField } from './configFormFields'

// "Step 2" of the Studio editor -- styles the donation form that opens
// when someone clicks Donate on the card (DonateModal ->
// DonateCheckout/OrganizationDonateCheckout), completely independent of
// the card's own appearance (EmbedConfigForm.jsx, "step 1"). An org might
// want its embed card to blend into its own site's look while the actual
// payment form stays close to Dolelma's own branding, or vice versa --
// tying the two together would take that choice away, so they're two
// separate `configuration` keys edited on two separate screens. Also owns
// the return-url field -- where a donor lands once this flow finishes
// belongs conceptually with the flow itself, not the card.
export function DonationFlowConfigForm({ embed, onConfigurationChange, onReturnUrlChange }) {
  const config = mergeConfiguration(embed.configuration)
  const flow = config.donationFlow

  function setFlow(patch) {
    onConfigurationChange({ ...config, donationFlow: { ...flow, ...patch } })
  }

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <p className="section-label">Donation flow appearance</p>
        <p className="text-xs text-muted-foreground -mt-1">
          Styles the donation form itself, once someone clicks Donate -- independent of the card's own design.
        </p>
        <div className="space-y-3">
          <ColorField label="Button color" value={flow.buttonColor} placeholder="#111111" onChange={(v) => setFlow({ buttonColor: v })} />
          <ColorField label="Background" value={flow.backgroundColor} placeholder="#ffffff" onChange={(v) => setFlow({ backgroundColor: v })} />
          <ColorField label="Text color" value={flow.textColor} placeholder="#111111" onChange={(v) => setFlow({ textColor: v })} />
        </div>
        <Field label={`Card corner radius (${flow.borderRadius}px)`}>
          <input
            type="range" min={0} max={32} value={flow.borderRadius}
            onChange={(e) => setFlow({ borderRadius: Number(e.target.value) })} className="w-full"
          />
        </Field>
        <Field label={`Button corner radius (${flow.buttonRadius}px)`}>
          <input
            type="range" min={0} max={32} value={flow.buttonRadius}
            onChange={(e) => setFlow({ buttonRadius: Number(e.target.value) })} className="w-full"
          />
        </Field>
        <Field label="Font family" hint="A curated set of web-safe fonts, loaded securely -- not a free-text field.">
          <Select
            value={flow.fontFamily}
            onChange={(e) => setFlow({ fontFamily: e.target.value })}
            options={FONT_OPTIONS.map((f) => ({ value: f.value, label: f.label }))}
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
