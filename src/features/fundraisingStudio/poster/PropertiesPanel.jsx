import { AlertTriangle, ArrowDownToLine, ArrowUpToLine, Trash2 } from 'lucide-react'
import { BINDING_FIELDS } from './designSchema'

// Relative luminance contrast, simplified (WCAG-style) -- used only to warn
// when a QR code's foreground/background colors are too close to remain
// reliably scannable, per the spec's "visible warning" requirement. Not a
// full WCAG contrast implementation (no gamma-correct sRGB conversion) --
// good enough to catch "light gray on white" without pulling in a library
// for something this small.
function relativeLuminance(hex) {
  const c = hex.replace('#', '')
  const r = parseInt(c.substring(0, 2), 16) / 255
  const g = parseInt(c.substring(2, 4), 16) / 255
  const b = parseInt(c.substring(4, 6), 16) / 255
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrastRatio(hex1, hex2) {
  const l1 = relativeLuminance(hex1)
  const l2 = relativeLuminance(hex2)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

export function PropertiesPanel({ element, onChange, onDelete, onBringToFront, onSendToBack }) {
  if (!element) {
    return <p className="text-sm text-muted-foreground py-8 text-center">Select an element to edit its properties.</p>
  }

  function set(patch) {
    onChange({ ...element, ...patch })
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="section-label">{element.type} properties</p>
        <div className="flex items-center gap-1">
          <button type="button" title="Bring to front" onClick={onBringToFront} className="p-1.5 rounded-md hover:bg-accent">
            <ArrowUpToLine className="w-3.5 h-3.5" />
          </button>
          <button type="button" title="Send to back" onClick={onSendToBack} className="p-1.5 rounded-md hover:bg-accent">
            <ArrowDownToLine className="w-3.5 h-3.5" />
          </button>
          <button type="button" title="Delete" onClick={onDelete} className="p-1.5 rounded-md hover:bg-destructive/10 hover:text-destructive">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {element.type === 'text' && (
        <>
          <Field label="Dynamic content">
            <select value={element.binding} onChange={(e) => set({ binding: e.target.value })} className={inputClass}>
              {BINDING_FIELDS.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
            </select>
          </Field>
          {!element.binding && (
            <Field label="Text">
              <textarea value={element.text} onChange={(e) => set({ text: e.target.value })} rows={3} className={inputClass} />
            </Field>
          )}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Font size"><NumberInput value={element.fontSize} onChange={(v) => set({ fontSize: v })} /></Field>
            <Field label="Weight">
              <select value={element.fontWeight} onChange={(e) => set({ fontWeight: e.target.value })} className={inputClass}>
                <option value="normal">Normal</option>
                <option value="bold">Bold</option>
              </select>
            </Field>
          </div>
          <Field label="Alignment">
            <select value={element.align} onChange={(e) => set({ align: e.target.value })} className={inputClass}>
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </Field>
          <Field label="Color"><ColorInput value={element.color} onChange={(v) => set({ color: v })} /></Field>
        </>
      )}

      {element.type === 'image' && (
        <>
          <Field label="Dynamic source">
            <select value={element.binding} onChange={(e) => set({ binding: e.target.value })} className={inputClass}>
              <option value="">Uploaded image</option>
              <option value="cover_image_url">Destination cover image</option>
              <option value="organization_logo_url">Organization logo</option>
            </select>
          </Field>
          <Field label="Object fit">
            <select value={element.objectFit} onChange={(e) => set({ objectFit: e.target.value })} className={inputClass}>
              <option value="cover">Cover (crop to fill)</option>
              <option value="fill">Stretch to fill</option>
            </select>
          </Field>
          <Field label="Corner radius"><NumberInput value={element.borderRadius} onChange={(v) => set({ borderRadius: v })} /></Field>
        </>
      )}

      {element.type === 'shape' && (
        <>
          <Field label="Fill color"><ColorInput value={element.fill} onChange={(v) => set({ fill: v })} /></Field>
          {element.shapeType === 'rect' && (
            <Field label="Corner radius"><NumberInput value={element.cornerRadius} onChange={(v) => set({ cornerRadius: v })} /></Field>
          )}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Stroke color"><ColorInput value={element.stroke || '#000000'} onChange={(v) => set({ stroke: v })} /></Field>
            <Field label="Stroke width"><NumberInput value={element.strokeWidth} onChange={(v) => set({ strokeWidth: v })} /></Field>
          </div>
        </>
      )}

      {element.type === 'qr' && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Foreground"><ColorInput value={element.fgColor} onChange={(v) => set({ fgColor: v })} /></Field>
            <Field label="Background"><ColorInput value={element.bgColor} onChange={(v) => set({ bgColor: v })} /></Field>
          </div>
          {contrastRatio(element.fgColor, element.bgColor) < 3 && (
            <p className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 rounded-lg p-2.5">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              These colors are too close in contrast -- this QR code may not scan reliably.
            </p>
          )}
        </>
      )}

      <Field label="Opacity">
        <input
          type="range" min={0} max={1} step={0.05} value={element.opacity}
          onChange={(e) => set({ opacity: Number(e.target.value) })} className="w-full"
        />
      </Field>
    </div>
  )
}

const inputClass = 'w-full px-3 py-2 rounded-lg border bg-background text-sm'

function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground block mb-1">{label}</label>
      {children}
    </div>
  )
}

function NumberInput({ value, onChange }) {
  return (
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className={inputClass}
    />
  )
}

function ColorInput({ value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="w-9 h-9 rounded-md border cursor-pointer" />
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className={inputClass} />
    </div>
  )
}
