import { describe, expect, it } from 'vitest'
import { buildInitialDesign, findBackgroundImage, findBackgroundScrim } from './templateCompositions'
import { POSTER_TEMPLATES } from '../shared/posterTemplates'

describe('buildInitialDesign', () => {
  it('includes progress/goal/deadline elements for a campaign destination', () => {
    const design = buildInitialDesign('campaign')
    const bindings = design.elements.map((el) => el.binding).filter(Boolean)
    expect(bindings).toEqual(expect.arrayContaining(['raised', 'goal', 'deadline']))
  })

  it('omits progress/goal/deadline elements for an organization destination', () => {
    const design = buildInitialDesign('organization')
    const bindings = design.elements.map((el) => el.binding).filter(Boolean)
    expect(bindings).not.toEqual(expect.arrayContaining(['raised']))
    expect(bindings).not.toEqual(expect.arrayContaining(['goal']))
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
