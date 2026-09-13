// Shared low-level form fields for the Embed Studio's two config forms --
// EmbedConfigForm.jsx (the card's own content/appearance) and
// DonationFlowConfigForm.jsx (the donation flow's independent appearance).
// Pulled out once a second form needed the exact same color-field/labeled-
// field shape, rather than duplicating it.
export const inputClass = 'w-full px-3 py-2 rounded-lg border bg-background text-sm'

export function Field({ label, hint, children }) {
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
export function ColorField({ label, value, placeholder, onChange }) {
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
