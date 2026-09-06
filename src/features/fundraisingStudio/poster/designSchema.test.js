import { describe, expect, it } from 'vitest'
import {
  createImageElement, createQrElement, createShapeElement, createTextElement, formatBindingValue,
} from './designSchema'

describe('element factories', () => {
  it('createTextElement gives each element a unique id', () => {
    const a = createTextElement()
    const b = createTextElement()
    expect(a.id).not.toEqual(b.id)
    expect(a.type).toBe('text')
  })

  it('createImageElement defaults to no binding (a plain uploaded image)', () => {
    const el = createImageElement()
    expect(el.type).toBe('image')
    expect(el.binding).toBe('')
    expect(el.objectFit).toBe('cover')
  })

  it('createShapeElement supports overriding shapeType', () => {
    const circle = createShapeElement({ shapeType: 'circle', width: 160 })
    expect(circle.shapeType).toBe('circle')
    expect(circle.width).toBe(160)
  })

  it('createQrElement has sane default colors', () => {
    const qr = createQrElement()
    expect(qr.fgColor).toBe('#000000')
    expect(qr.bgColor).toBe('#ffffff')
  })

  it('overrides win over defaults', () => {
    const el = createTextElement({ x: 5, text: 'Hi' })
    expect(el.x).toBe(5)
    expect(el.text).toBe('Hi')
  })
})

describe('formatBindingValue', () => {
  const destination = {
    title: 'Build a Well', raised: 2500, goal: 10000, progress_percent: 25,
    deadline: '2026-12-31', is_ongoing: false,
  }

  it('returns null-safe empty string with no destination', () => {
    expect(formatBindingValue('title', null)).toBe('')
  })

  it('formats money bindings with the D prefix', () => {
    expect(formatBindingValue('raised', destination)).toBe('D 2,500')
    expect(formatBindingValue('goal', destination)).toBe('D 10,000')
  })

  it('formats progress_percent with a % suffix', () => {
    expect(formatBindingValue('progress_percent', destination)).toBe('25%')
  })

  it('formats a real deadline as a date', () => {
    expect(formatBindingValue('deadline', destination)).toContain('2026')
  })

  it('shows "Ongoing" for an open-ended campaign regardless of the raw deadline value', () => {
    expect(formatBindingValue('deadline', { ...destination, deadline: null, is_ongoing: true })).toBe('Ongoing')
  })

  it('falls back to the raw field for an unrecognized binding', () => {
    expect(formatBindingValue('title', destination)).toBe('Build a Well')
  })
})
