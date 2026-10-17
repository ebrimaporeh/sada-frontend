import { describe, expect, it } from 'vitest'
import { buildInitialDesign, findBackgroundImage, findBackgroundScrim } from './templateCompositions'
import { formatBindingValue } from './designSchema'
import { POSTER_TEMPLATES } from '../shared/posterTemplates'

describe('buildInitialDesign', () => {
  it('includes a goal binding (not a raised-amount one) and a deadline binding for a campaign destination', () => {
    const design = buildInitialDesign('campaign')
    const bindings = design.elements.map((el) => el.binding).filter(Boolean)
    expect(bindings).toEqual(expect.arrayContaining(['goal', 'deadline']))
    expect(bindings).not.toEqual(expect.arrayContaining(['raised']))
  })

  it('omits the goal/deadline elements for an organization destination', () => {
    const design = buildInitialDesign('organization')
    const bindings = design.elements.map((el) => el.binding).filter(Boolean)
    expect(bindings).not.toEqual(expect.arrayContaining(['raised']))
    expect(bindings).not.toEqual(expect.arrayContaining(['goal']))
  })

  it('labels the goal amount ("Goal: D ...") rather than showing the bare number', () => {
    expect(formatBindingValue('goal', { goal: 50000 })).toBe('Goal: D 50,000')
  })

  it('defaults every text element to Times New Roman', () => {
    const design = buildInitialDesign('campaign')
    for (const el of design.elements.filter((e) => e.type === 'text')) {
      expect(el.fontFamily).toBe('Times New Roman')
    }
  })

  it('sizes the QR code 15% bigger than the old 0.16-of-min-dimension baseline', () => {
    const square = POSTER_TEMPLATES.find((t) => t.value === 'square')
    const design = buildInitialDesign('campaign')
    const qr = design.elements.find((el) => el.type === 'qr')
    const baseline = Math.round(Math.min(square.width, square.height) * 0.16)
    expect(qr.width).toBeCloseTo(baseline * 1.15, 0)
  })

  // The divider/progress-bar shape only ever made sense above the "amount
  // raised" row it used to sit on top of -- removed alongside that row;
  // the scrim (a shape too) is the only shape left in the composition.
  it('has no divider/progress-bar shape left now that the raised-amount row is gone', () => {
    const design = buildInitialDesign('campaign')
    expect(design.elements.filter((el) => el.type === 'shape')).toHaveLength(1)
  })

  it('raises the caption block clear of the QR row instead of sharing its baseline', () => {
    const design = buildInitialDesign('campaign')
    const title = design.elements.find((el) => el.binding === 'title')
    const qr = design.elements.find((el) => el.type === 'qr')
    // The QR sits at its plain bottom-right baseline (height - pad - qrSize,
    // no lift); the caption block's own lift must be strictly more than
    // zero for the title (its topmost, smallest-y row) to end up above that.
    const plainQrY = design.height - Math.round(design.width * 0.055) - qr.width
    expect(qr.y).toBeCloseTo(plainQrY, 0)
    expect(title.y).toBeLessThan(qr.y)
  })

  it('always includes a title binding, an organization_name binding, and a QR element', () => {
    const design = buildInitialDesign('organization')
    expect(design.elements.some((el) => el.binding === 'title')).toBe(true)
    expect(design.elements.some((el) => el.binding === 'organization_name')).toBe(true)
    expect(design.elements.some((el) => el.type === 'qr')).toBe(true)
  })

  it('uses the destination cover photo as a full-bleed background with a dark overlay', () => {
    const design = buildInitialDesign('campaign')
    const [cover, overlay] = design.elements
    expect(cover).toMatchObject({ type: 'image', binding: 'cover_image_url', x: 0, y: 0, width: design.width, height: design.height })
    expect(overlay).toMatchObject({ type: 'shape', x: 0, y: 0, width: design.width, height: design.height })
  })

  it('defaults the background to the campaign cover photo', () => {
    const design = buildInitialDesign('campaign')
    expect(findBackgroundImage(design)).toMatchObject({ binding: 'cover_image_url' })
  })

  it('defaults the background to the organization logo when there is no cover photo', () => {
    const design = buildInitialDesign('organization')
    expect(findBackgroundImage(design)).toMatchObject({ binding: 'organization_logo_url' })
  })

  it('findBackgroundScrim locates the legibility overlay stacked on the background image', () => {
    const design = buildInitialDesign('campaign')
    expect(findBackgroundScrim(design)).toMatchObject({ type: 'shape', listening: false })
  })

  // Always built at the canonical Square reference now -- one poster covers
  // all three layouts, derived from this at render time (layoutProjection.js),
  // rather than three separately-generated designs.
  it('is always built at the canonical Square reference size', () => {
    const square = POSTER_TEMPLATES.find((t) => t.value === 'square')
    const design = buildInitialDesign('campaign')
    expect(design.width).toBe(square.width)
    expect(design.height).toBe(square.height)
    expect(design.elements.length).toBeGreaterThan(0)
    // Every element must stay within the canvas.
    for (const el of design.elements) {
      expect(el.y).toBeGreaterThanOrEqual(0)
      expect(el.y + (el.height ?? el.fontSize ?? 0)).toBeLessThanOrEqual(design.height)
    }
  })
})
