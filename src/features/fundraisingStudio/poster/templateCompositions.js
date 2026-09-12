import {
  createImageElement, createQrElement, createShapeElement, createTextElement,
} from './designSchema'
import { POSTER_TEMPLATES } from '../shared/posterTemplates'

// Every template is the same composition at a different aspect ratio (see
// posterTemplates.js for why sizes, not styles) -- the destination's cover
// photo fills the frame, a dark scrim sits over it for legibility, and
// title/org/description/QR are anchored to the bottom-left, sized as a
// fraction of canvas width so square/story/wide all read consistently at
// their own scale. Not five bespoke palettes anymore (see the old
// TEMPLATE_STYLES this replaced) -- what differs between templates now is
// pure geometry. Still "a configurable starting composition, not a locked
// design" -- once created, every element below is freely moved/edited/
// deleted like any other (PosterEditor.jsx).
const OVERLAY_COLOR = 'rgba(8, 11, 20, 0.55)'
const BACKGROUND_FALLBACK = '#0f172a'

export function buildInitialDesign(template, destinationType) {
  const size = POSTER_TEMPLATES.find((t) => t.value === template) ?? POSTER_TEMPLATES[0]
  const { width, height } = size
  const hasStats = destinationType === 'campaign'

  const pad = Math.round(width * 0.055)
  const qrSize = Math.round(Math.min(width, height) * 0.16)
  const titleFontSize = Math.round(width * 0.048)
  const orgFontSize = Math.round(width * 0.024)
  const descFontSize = Math.round(width * 0.02)
  const textWidth = width - pad * 2 - qrSize - Math.round(pad * 0.4)

  // Stacked bottom-up: figure out the total block height first, then place
  // each row from there down to `pad` above the bottom edge -- keeps the
  // whole caption block glued to the bottom regardless of canvas height
  // (story's is more than 3x wide's).
  const rows = [
    { key: 'title', fontSize: titleFontSize, gap: Math.round(titleFontSize * 0.35) },
    { key: 'org', fontSize: orgFontSize, gap: Math.round(orgFontSize * 0.5) },
    { key: 'desc', fontSize: descFontSize, gap: Math.round(descFontSize * 1.4) },
  ]
  if (hasStats) {
    rows.push(
      { key: 'divider', fontSize: Math.round(width * 0.011), gap: Math.round(descFontSize * 0.8) },
      { key: 'raised', fontSize: Math.round(titleFontSize * 0.55), gap: Math.round(descFontSize * 0.3) },
      { key: 'goal', fontSize: descFontSize, gap: Math.round(descFontSize * 0.25) },
      { key: 'deadline', fontSize: descFontSize, gap: 0 },
    )
  }
  const contentHeight = rows.reduce((sum, row) => sum + row.fontSize + row.gap, 0)

  const y = {}
  let cursor = height - pad - contentHeight
  for (const row of rows) {
    y[row.key] = cursor
    cursor += row.fontSize + row.gap
  }

  // `fromTemplate: true` marks every element this function produces so
  // PosterEditor.jsx's size-switch handler can tell them apart from
  // elements the user added themselves -- the former gets regenerated at
  // the new size (see the comment there for why), the latter gets kept.
  const elements = [
    createImageElement({ x: 0, y: 0, width, height, binding: 'cover_image_url', objectFit: 'cover', fromTemplate: true }),
    // `listening: false` -- a full-bleed scrim stacked directly on top of
    // the full-bleed cover photo would otherwise intercept every click
    // meant for that image (Konva hits the topmost node), making the
    // photo underneath impossible to select/resize. The scrim stays
    // visible, just excluded from hit-testing (see PosterElementNode.jsx).
    createShapeElement({ x: 0, y: 0, width, height, shapeType: 'rect', fill: OVERLAY_COLOR, listening: false, fromTemplate: true }),
    createTextElement({ x: pad, y: y.title, width: textWidth, binding: 'title', fontSize: titleFontSize, fontWeight: 'bold', color: '#ffffff', fromTemplate: true }),
    createTextElement({ x: pad, y: y.org, width: textWidth, binding: 'organization_name', fontSize: orgFontSize, color: '#e2e8f0', fromTemplate: true }),
    createTextElement({ x: pad, y: y.desc, width: textWidth, binding: 'description', fontSize: descFontSize, color: '#cbd5e1', fromTemplate: true }),
    createQrElement({ x: width - pad - qrSize, y: height - pad - qrSize, width: qrSize, height: qrSize, fromTemplate: true }),
  ]

  if (hasStats) {
    elements.push(
      createShapeElement({
        x: pad, y: y.divider, width: textWidth, height: Math.round(width * 0.011),
        shapeType: 'rect', fill: 'rgba(255, 255, 255, 0.25)', cornerRadius: 999, fromTemplate: true,
      }),
      createTextElement({ x: pad, y: y.raised, width: textWidth, binding: 'raised', fontSize: Math.round(titleFontSize * 0.55), fontWeight: 'bold', color: '#ffffff', fromTemplate: true }),
      createTextElement({ x: pad, y: y.goal, width: textWidth, binding: 'goal', fontSize: descFontSize, color: '#cbd5e1', fromTemplate: true }),
      createTextElement({ x: pad, y: y.deadline, width: textWidth, binding: 'deadline', fontSize: descFontSize, color: '#cbd5e1', fromTemplate: true }),
    )
  }

  return { version: 1, width, height, background: BACKGROUND_FALLBACK, elements }
}
