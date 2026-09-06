import {
  CANVAS_WIDTH, CANVAS_HEIGHT, createImageElement, createQrElement, createShapeElement, createTextElement,
} from './designSchema'

// Per-template styling -- the templates share one structural skeleton
// (cover image, heading, org name, description, stats row for campaigns,
// QR corner) and differ only in palette/type treatment. This is
// deliberately not five bespoke layouts: "configurable starting
// compositions," not a locked design each, per the product brief -- once
// created, every element below is freely moved/edited/deleted like any
// other.
const TEMPLATE_STYLES = {
  classic: { background: '#ffffff', headingColor: '#111111', accentColor: '#111111', bodyColor: '#4b5563' },
  modern: { background: '#0f172a', headingColor: '#ffffff', accentColor: '#38bdf8', bodyColor: '#cbd5e1' },
  minimal: { background: '#ffffff', headingColor: '#111111', accentColor: '#111111', bodyColor: '#6b7280' },
  bold: { background: '#dc2626', headingColor: '#ffffff', accentColor: '#ffffff', bodyColor: '#fecaca' },
  community: { background: '#fef3c7', headingColor: '#78350f', accentColor: '#b45309', bodyColor: '#92400e' },
}

export function buildInitialDesign(template, destinationType) {
  const style = TEMPLATE_STYLES[template] ?? TEMPLATE_STYLES.classic
  const elements = [
    createImageElement({
      x: 0, y: 0, width: CANVAS_WIDTH, height: 640, binding: 'cover_image_url', objectFit: 'cover',
    }),
    createTextElement({
      x: 60, y: 680, width: CANVAS_WIDTH - 120, binding: 'title', fontSize: 56, fontWeight: 'bold', color: style.headingColor,
    }),
    createTextElement({
      x: 60, y: 780, width: CANVAS_WIDTH - 120, binding: 'organization_name', fontSize: 28, color: style.accentColor,
    }),
    createTextElement({
      x: 60, y: 830, width: CANVAS_WIDTH - 300, binding: 'description', fontSize: 24, color: style.bodyColor,
    }),
    createQrElement({ x: CANVAS_WIDTH - 240, y: CANVAS_HEIGHT - 240, width: 180, height: 180 }),
  ]

  if (destinationType === 'campaign') {
    elements.push(
      createShapeElement({
        x: 60, y: 1000, width: CANVAS_WIDTH - 120, height: 12, shapeType: 'rect', fill: `${style.accentColor}33`, cornerRadius: 6,
      }),
      createTextElement({
        x: 60, y: 1030, width: 400, binding: 'raised', fontSize: 32, fontWeight: 'bold', color: style.headingColor,
      }),
      createTextElement({
        x: 60, y: 1075, width: 400, binding: 'goal', fontSize: 20, color: style.bodyColor,
      }),
      createTextElement({
        x: 60, y: 1120, width: 400, binding: 'deadline', fontSize: 20, color: style.bodyColor,
      }),
    )
  }

  return { version: 1, width: CANVAS_WIDTH, height: CANVAS_HEIGHT, background: style.background, elements }
}
