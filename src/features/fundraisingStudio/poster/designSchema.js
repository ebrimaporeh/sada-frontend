import { nanoid } from 'nanoid'

// The poster's serializable canvas document -- {version, width, height,
// background, elements: [...]}. Persisted as Poster.design (a plain
// JSONField on the backend, no schema enforcement there) -- this file is
// the one place both the editor and the renderer agree on its shape.
export const CANVAS_WIDTH = 1080
export const CANVAS_HEIGHT = 1350

export function emptyDesign(background = '#ffffff') {
  return { version: 1, width: CANVAS_WIDTH, height: CANVAS_HEIGHT, background, elements: [] }
}

// Bindings are dot-free keys directly off the flat FundraisingDestination
// shape the backend serializes (services/fundraising_destination.py) --
// see formatBindingValue below for how each renders, including the
// open-ended-campaign "Ongoing" case.
export const BINDING_FIELDS = [
  { value: '', label: 'None (static text)' },
  { value: 'title', label: 'Title' },
  { value: 'description', label: 'Description' },
  { value: 'organization_name', label: 'Organization name' },
  { value: 'raised', label: 'Amount raised' },
  { value: 'goal', label: 'Goal' },
  { value: 'progress_percent', label: 'Progress %' },
  { value: 'deadline', label: 'Deadline / Ongoing' },
  { value: 'donation_url', label: 'Donation URL' },
]

function baseElement(type, overrides) {
  return {
    id: nanoid(8),
    type,
    x: 100,
    y: 100,
    rotation: 0,
    opacity: 1,
    ...overrides,
  }
}

export function createTextElement(overrides = {}) {
  return baseElement('text', {
    width: 400,
    text: 'Edit this text',
    binding: '',
    fontFamily: 'sans-serif',
    fontSize: 40,
    fontWeight: 'normal',
    align: 'left',
    color: '#111111',
    ...overrides,
  })
}

export function createImageElement(overrides = {}) {
  return baseElement('image', {
    width: 400,
    height: 300,
    src: '',
    binding: '', // 'cover_image_url' or 'organization_logo_url'
    objectFit: 'cover',
    borderRadius: 0,
    ...overrides,
  })
}

export function createShapeElement(overrides = {}) {
  return baseElement('shape', {
    width: 200,
    height: 200,
    shapeType: 'rect', // rect | circle | line
    fill: '#e5e5e5',
    stroke: '',
    strokeWidth: 0,
    cornerRadius: 0,
    ...overrides,
  })
}

export function createQrElement(overrides = {}) {
  return baseElement('qr', {
    width: 180,
    height: 180,
    fgColor: '#000000',
    bgColor: '#ffffff',
    ...overrides,
  })
}

// Renders a binding for display -- shared by the canvas and (indirectly)
// export, since export just rasterizes whatever the canvas already shows.
export function formatBindingValue(binding, destination) {
  if (!destination) return ''
  const value = destination[binding]
  switch (binding) {
    case 'raised':
    case 'goal':
      return value == null ? '' : `D ${Math.round(Number(value)).toLocaleString('en-US')}`
    case 'progress_percent':
      return value == null ? '' : `${value}%`
    case 'deadline':
      if (destination.is_ongoing) return 'Ongoing'
      return value ? new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''
    default:
      return value ?? ''
  }
}
