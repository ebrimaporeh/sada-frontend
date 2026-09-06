import { describe, expect, it } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useDesignHistory } from './useDesignHistory'

describe('useDesignHistory', () => {
  it('starts with the initial design and nothing to undo', () => {
    const { result } = renderHook(() => useDesignHistory({ elements: [] }))
    expect(result.current.design).toEqual({ elements: [] })
    expect(result.current.canUndo).toBe(false)
    expect(result.current.canRedo).toBe(false)
  })

  it('commit pushes a new entry and enables undo', () => {
    const { result } = renderHook(() => useDesignHistory({ elements: [] }))
    act(() => result.current.commit({ elements: [{ id: 1 }] }))
    expect(result.current.design).toEqual({ elements: [{ id: 1 }] })
    expect(result.current.canUndo).toBe(true)
    expect(result.current.canRedo).toBe(false)
  })

  it('undo restores the previous state and enables redo', () => {
    const { result } = renderHook(() => useDesignHistory({ elements: [] }))
    act(() => result.current.commit({ elements: [{ id: 1 }] }))
    act(() => result.current.undo())
    expect(result.current.design).toEqual({ elements: [] })
    expect(result.current.canUndo).toBe(false)
    expect(result.current.canRedo).toBe(true)
  })

  it('redo re-applies an undone change', () => {
    const { result } = renderHook(() => useDesignHistory({ elements: [] }))
    act(() => result.current.commit({ elements: [{ id: 1 }] }))
    act(() => result.current.undo())
    act(() => result.current.redo())
    expect(result.current.design).toEqual({ elements: [{ id: 1 }] })
  })

  it('committing after an undo discards the redo branch', () => {
    const { result } = renderHook(() => useDesignHistory({ elements: [] }))
    act(() => result.current.commit({ elements: [{ id: 1 }] }))
    act(() => result.current.undo())
    act(() => result.current.commit({ elements: [{ id: 2 }] }))
    expect(result.current.canRedo).toBe(false)
    act(() => result.current.undo())
    expect(result.current.design).toEqual({ elements: [] })
  })

  it('undo/redo at the boundaries are no-ops', () => {
    const { result } = renderHook(() => useDesignHistory({ elements: [] }))
    act(() => result.current.undo())
    expect(result.current.design).toEqual({ elements: [] })
    act(() => result.current.redo())
    expect(result.current.design).toEqual({ elements: [] })
  })
})
