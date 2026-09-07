import { describe, expect, it } from 'vitest'
import { buildInitialDesign } from './templateCompositions'
import { POSTER_TEMPLATES } from '../shared/posterTemplates'

describe('buildInitialDesign', () => {
  it('includes progress/goal/deadline elements for a campaign destination', () => {
    const design = buildInitialDesign('square', 'campaign')
    const bindings = design.elements.map((el) => el.binding).filter(Boolean)
    expect(bindings).toEqual(expect.arrayContaining(['raised', 'goal', 'deadline']))
  })

  it('omits progress/goal/deadline elements for an organization destination', () => {
    const design = buildInitialDesign('square', 'organization')
    const bindings = design.elements.map((el) => el.binding).filter(Boolean)
    expect(bindings).not.toEqual(expect.arrayContaining(['raised']))
    expect(bindings).not.toEqual(expect.arrayContaining(['goal']))
  })

  it('always includes a title binding, an organization_name binding, and a QR element', () => {
    const design = buildInitialDesign('story', 'organization')
    expect(design.elements.some((el) => el.binding === 'title')).toBe(true)
    expect(design.elements.some((el) => el.binding === 'organization_name')).toBe(true)
    expect(design.elements.some((el) => el.type === 'qr')).toBe(true)
  })

  it('uses the destination cover photo as a full-bleed background with a dark overlay', () => {
    const design = buildInitialDesign('wide', 'campaign')
    const [cover, overlay] = design.elements
    expect(cover).toMatchObject({ type: 'image', binding: 'cover_image_url', x: 0, y: 0, width: design.width, height: design.height })
    expect(overlay).toMatchObject({ type: 'shape', x: 0, y: 0, width: design.width, height: design.height })
  })

  it('falls back to the first template size for an unrecognized template', () => {
    const design = buildInitialDesign('not-a-real-template', 'campaign')
    expect(design.width).toBe(POSTER_TEMPLATES[0].width)
    expect(design.height).toBe(POSTER_TEMPLATES[0].height)
  })

  it('every template produces a valid design document sized to its own aspect ratio', () => {
    for (const t of POSTER_TEMPLATES) {
      const design = buildInitialDesign(t.value, 'campaign')
      expect(design.width).toBe(t.width)
      expect(design.height).toBe(t.height)
      expect(design.elements.length).toBeGreaterThan(0)
      // Every element must stay within the canvas -- guards against the
      // bottom-up text stack overflowing on the shortest template ('wide').
      for (const el of design.elements) {
        expect(el.y).toBeGreaterThanOrEqual(0)
        expect(el.y + (el.height ?? el.fontSize ?? 0)).toBeLessThanOrEqual(design.height)
      }
    }
  })
})
