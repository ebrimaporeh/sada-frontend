import { describe, expect, it } from 'vitest'
import { buildInitialDesign } from './templateCompositions'

describe('buildInitialDesign', () => {
  it('includes progress/goal/deadline elements for a campaign destination', () => {
    const design = buildInitialDesign('classic', 'campaign')
    const bindings = design.elements.map((el) => el.binding).filter(Boolean)
    expect(bindings).toEqual(expect.arrayContaining(['raised', 'goal', 'deadline']))
  })

  it('omits progress/goal/deadline elements for an organization destination', () => {
    const design = buildInitialDesign('classic', 'organization')
    const bindings = design.elements.map((el) => el.binding).filter(Boolean)
    expect(bindings).not.toEqual(expect.arrayContaining(['raised']))
    expect(bindings).not.toEqual(expect.arrayContaining(['goal']))
  })

  it('always includes a title binding, an organization_name binding, and a QR element', () => {
    const design = buildInitialDesign('modern', 'organization')
    expect(design.elements.some((el) => el.binding === 'title')).toBe(true)
    expect(design.elements.some((el) => el.binding === 'organization_name')).toBe(true)
    expect(design.elements.some((el) => el.type === 'qr')).toBe(true)
  })

  it('falls back to the classic style for an unrecognized template', () => {
    const design = buildInitialDesign('not-a-real-template', 'campaign')
    expect(design.background).toBe('#ffffff')
  })

  it('every template produces a valid design document', () => {
    for (const template of ['classic', 'modern', 'minimal', 'bold', 'community']) {
      const design = buildInitialDesign(template, 'campaign')
      expect(design.width).toBeGreaterThan(0)
      expect(design.height).toBeGreaterThan(0)
      expect(design.elements.length).toBeGreaterThan(0)
    }
  })
})
