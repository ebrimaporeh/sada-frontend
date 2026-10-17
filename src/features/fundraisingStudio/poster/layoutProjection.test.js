import { describe, expect, it } from 'vitest'
import {
  applyElementPatch, clearElementOverride, hasElementOverride, isGeometryPatch,
  projectElementsForLayout, removeElementEverywhere,
} from './layoutProjection'
import { POSTER_TEMPLATES } from '../shared/posterTemplates'

const SQUARE = POSTER_TEMPLATES.find((t) => t.value === 'square')
const STORY = POSTER_TEMPLATES.find((t) => t.value === 'story')

function makeDesign(elements, layoutOverrides) {
  return { version: 1, width: SQUARE.width, height: SQUARE.height, background: '#fff', elements, layoutOverrides }
}

describe('isGeometryPatch', () => {
  it('is true only when every key is a geometry key', () => {
    expect(isGeometryPatch({ x: 1, y: 2 })).toBe(true)
    expect(isGeometryPatch({ text: 'hi' })).toBe(false)
    expect(isGeometryPatch({ x: 1, text: 'hi' })).toBe(false)
  })
})

describe('projectElementsForLayout', () => {
  it('returns the shared elements untouched for the canonical (Square) layout', () => {
    const elements = [{ id: 'a', type: 'text', x: 10, y: 20, width: 100, height: 30, fontSize: 12, rotation: 0 }]
    const design = makeDesign(elements)
    expect(projectElementsForLayout(design, 'square')).toBe(elements)
  })

  it('scales a text element independently per axis for a non-canonical layout', () => {
    const elements = [{ id: 'a', type: 'text', x: 100, y: 900, width: 200, height: 50, fontSize: 40, rotation: 0 }]
    const design = makeDesign(elements)
    const sx = STORY.width / SQUARE.width
    const sy = STORY.height / SQUARE.height
    const [projected] = projectElementsForLayout(design, 'story')
    expect(projected.x).toBeCloseTo(100 * sx)
    expect(projected.y).toBeCloseTo(900 * sy)
    expect(projected.width).toBeCloseTo(200 * sx)
    expect(projected.height).toBeCloseTo(50 * sy)
    expect(projected.fontSize).toBeCloseTo(40 * sx)
  })

  it('keeps a QR element square by scaling its width/height uniformly, not per-axis', () => {
    const elements = [{ id: 'qr', type: 'qr', x: 800, y: 800, width: 180, height: 180, rotation: 0 }]
    const design = makeDesign(elements)
    const [projected] = projectElementsForLayout(design, 'wide')
    expect(projected.width).toBeCloseTo(projected.height)
  })

  it('a layout override fully replaces the scaled default geometry for that element/layout', () => {
    const elements = [{ id: 'a', type: 'text', x: 100, y: 900, width: 200, height: 50, fontSize: 40, rotation: 0 }]
    const design = makeDesign(elements, { story: { a: { x: 5, y: 6, width: 7, height: 8, fontSize: 9, rotation: 0 } } })
    const [projected] = projectElementsForLayout(design, 'story')
    expect(projected).toMatchObject({ x: 5, y: 6, width: 7, height: 8, fontSize: 9 })
    // Wide has no override for this element -- still derives from canonical.
    const [projectedWide] = projectElementsForLayout(design, 'wide')
    expect(projectedWide.x).not.toBe(5)
  })

  it('leaves non-geometry fields (content) identical across every layout', () => {
    const elements = [{ id: 'a', type: 'text', text: 'Hello', color: '#111', x: 0, y: 0, width: 10, rotation: 0 }]
    const design = makeDesign(elements)
    for (const layout of ['square', 'story', 'wide']) {
      const [projected] = projectElementsForLayout(design, layout)
      expect(projected.text).toBe('Hello')
      expect(projected.color).toBe('#111')
    }
  })
})

describe('applyElementPatch', () => {
  const elements = [{ id: 'a', type: 'text', text: 'Hi', x: 10, y: 10, width: 100, rotation: 0 }]

  it('writes a geometry patch directly onto the shared element while viewing the canonical layout', () => {
    const design = makeDesign(elements)
    const next = applyElementPatch(design, 'square', 'a', { x: 50, y: 60 })
    expect(next.elements[0]).toMatchObject({ x: 50, y: 60 })
    expect(next.layoutOverrides).toBeUndefined()
  })

  it('writes a geometry patch into layoutOverrides for a non-canonical layout, leaving the shared element untouched', () => {
    const design = makeDesign(elements)
    const next = applyElementPatch(design, 'story', 'a', { x: 50, y: 60 })
    expect(next.elements[0]).toMatchObject({ x: 10, y: 10 })
    expect(next.layoutOverrides.story.a).toMatchObject({ x: 50, y: 60 })
  })

  it('merges successive overrides for the same element/layout instead of replacing them', () => {
    const design = makeDesign(elements)
    const first = applyElementPatch(design, 'story', 'a', { x: 50 })
    const second = applyElementPatch(first, 'story', 'a', { y: 70 })
    expect(second.layoutOverrides.story.a).toMatchObject({ x: 50, y: 70 })
  })

  it('always writes a content patch onto the shared element, even while viewing a non-canonical layout', () => {
    const design = makeDesign(elements)
    const next = applyElementPatch(design, 'story', 'a', { text: 'Changed' })
    expect(next.elements[0].text).toBe('Changed')
    expect(next.layoutOverrides).toBeUndefined()
  })
})

describe('hasElementOverride / clearElementOverride', () => {
  it('reports and clears an override, and never reports one for the canonical layout', () => {
    const design = makeDesign([{ id: 'a', x: 0, y: 0 }], { story: { a: { x: 5 } } })
    expect(hasElementOverride(design, 'story', 'a')).toBe(true)
    expect(hasElementOverride(design, 'square', 'a')).toBe(false)
    const cleared = clearElementOverride(design, 'story', 'a')
    expect(hasElementOverride(cleared, 'story', 'a')).toBe(false)
  })
})

describe('removeElementEverywhere', () => {
  it('drops the element and its overrides in every layout', () => {
    const design = makeDesign(
      [{ id: 'a', x: 0, y: 0 }, { id: 'b', x: 1, y: 1 }],
      { story: { a: { x: 5 } }, wide: { a: { x: 9 } } },
    )
    const next = removeElementEverywhere(design, 'a')
    expect(next.elements.map((el) => el.id)).toEqual(['b'])
    expect(next.layoutOverrides.story.a).toBeUndefined()
    expect(next.layoutOverrides.wide.a).toBeUndefined()
  })
})
