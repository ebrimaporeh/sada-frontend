import { POSTER_TEMPLATES } from '../shared/posterTemplates'

// One poster now covers all three layouts (square/story/wide) at once --
// see .claude/backend/design-studio.md and Poster's own model docstring.
// Square is the canonical reference every element's own x/y/width/height/
// fontSize is expressed in; this file is the one place both the editor
// (reading a projected view, writing geometry back) and the exporter agree
// on how a layout other than Square is derived from that shared data.
export const CANONICAL_LAYOUT = 'square'
export const GEOMETRY_KEYS = ['x', 'y', 'width', 'height', 'fontSize', 'rotation']

export function isGeometryPatch(patch) {
  return Object.keys(patch).every((key) => GEOMETRY_KEYS.includes(key))
}

function layoutDims(layoutKey) {
  return POSTER_TEMPLATES.find((t) => t.value === layoutKey) ?? POSTER_TEMPLATES[0]
}

// Default (non-overridden) geometry for `layoutKey`, scaled from the
// canonical element independently per axis -- sx for x/width, sy for
// y/height -- so a bottom-anchored element stays anchored near the bottom
// regardless of how much taller/shorter the target layout is, without
// needing per-template bespoke math (see the old templateCompositions.js
// comment this replaces). Box width always scales by sx, same as every
// other element -- NOT by a bigger text-specific factor (an earlier
// version tried that, scaling a text box's width in lockstep with a
// bigger font size; it widened description boxes enough in Story to
// overlap the QR code, which sits at an sx-based x position that never
// moved to match -- confirmed as the actual cause of that overlap, not a
// hypothetical).
//
// QR codes are the one exception to the independent-per-axis rule, scaling
// width/height by the smaller of sx/sy -- an independently-scaled QR would
// stop being square and could stop scanning reliably.
//
// Font size is also an exception: it scales by the *geometric mean* of
// sx/sy, not sx alone. sx-only scaling left Story's text sized for a
// much-taller frame than it actually is (sx is ~1 there, so the font
// barely grew while the canvas got far taller -- reads tiny) and Wide's
// sized for a much shorter one (sx grows slightly while the canvas gets
// far shorter -- reads oversized/cramped). The geometric mean tracks the
// actual change in available space much more evenly across both axes,
// without touching box width -- a bigger font in an unchanged-width box
// just wraps onto more lines, which is what keeps it clear of the QR.
// Anything that still looks wrong for a given element/layout combination
// is exactly what a manual per-layout override (see applyElementPatch
// below) is for.
function defaultGeometryForLayout(element, sx, sy) {
  const sizeScale = element.type === 'qr' ? Math.min(sx, sy) : null
  const geometry = { x: element.x * sx, y: element.y * sy, rotation: element.rotation }
  if (typeof element.width === 'number') geometry.width = element.width * (sizeScale ?? sx)
  if (typeof element.height === 'number') geometry.height = element.height * (sizeScale ?? sy)
  if (typeof element.fontSize === 'number') geometry.fontSize = element.fontSize * Math.sqrt(sx * sy)
  return geometry
}

// The elements array to actually render/edit for `layoutKey` -- Square
// (the canonical layout) is the shared data itself, untouched; any other
// layout is derived by scaling, with a manual override (if one exists for
// that element in that layout) taking over entirely for the geometry keys.
export function projectElementsForLayout(design, layoutKey) {
  if (layoutKey === CANONICAL_LAYOUT) return design.elements
  const canonical = layoutDims(CANONICAL_LAYOUT)
  const target = layoutDims(layoutKey)
  const sx = target.width / canonical.width
  const sy = target.height / canonical.height
  const overrides = design.layoutOverrides?.[layoutKey] ?? {}
  return design.elements.map((element) => ({
    ...element,
    ...defaultGeometryForLayout(element, sx, sy),
    ...(overrides[element.id] ?? {}),
  }))
}

// Writes a patch coming from the canvas (drag/transform) or the
// Properties panel back onto `design`. A patch that touches only geometry
// keys while viewing a non-canonical layout is layout-specific (goes into
// layoutOverrides for *that* layout only); everything else -- content
// (text/binding/color/src/...), or any geometry edit made while viewing
// Square -- always touches the shared element directly, which is what
// keeps those changes visible across every layout.
export function applyElementPatch(design, layoutKey, id, patch) {
  if (layoutKey === CANONICAL_LAYOUT || !isGeometryPatch(patch)) {
    return { ...design, elements: design.elements.map((el) => (el.id === id ? { ...el, ...patch } : el)) }
  }
  const forLayout = { ...(design.layoutOverrides?.[layoutKey] ?? {}) }
  forLayout[id] = { ...forLayout[id], ...patch }
  return { ...design, layoutOverrides: { ...design.layoutOverrides, [layoutKey]: forLayout } }
}

export function hasElementOverride(design, layoutKey, id) {
  return layoutKey !== CANONICAL_LAYOUT && Boolean(design.layoutOverrides?.[layoutKey]?.[id])
}

// Drops a layout-specific override, reverting that one element back to
// its shared, canonically-scaled geometry for `layoutKey`.
export function clearElementOverride(design, layoutKey, id) {
  if (!design.layoutOverrides?.[layoutKey]?.[id]) return design
  const forLayout = { ...design.layoutOverrides[layoutKey] }
  delete forLayout[id]
  return { ...design, layoutOverrides: { ...design.layoutOverrides, [layoutKey]: forLayout } }
}

// Elements and layoutOverrides are keyed by element id -- deleting an
// element should also drop any now-orphaned override for it in every
// other layout, not just from the canonical array, or a later re-added
// element that happens to reuse... actually ids are nanoid-random, never
// reused, but a stale override entry would otherwise sit there forever as
// harmless but confusing dead weight.
export function removeElementEverywhere(design, id) {
  const layoutOverrides = {}
  for (const [layout, overrides] of Object.entries(design.layoutOverrides ?? {})) {
    const { [id]: _removed, ...rest } = overrides
    layoutOverrides[layout] = rest
  }
  return { ...design, elements: design.elements.filter((el) => el.id !== id), layoutOverrides }
}
