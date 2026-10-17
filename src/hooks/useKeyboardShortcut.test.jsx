import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useKeyboardShortcut, isMac } from './useKeyboardShortcut'

// `mod` is Cmd on Mac, Ctrl everywhere else -- build the keyboard event
// init from the module's own `isMac` rather than assuming one platform, so
// this test passes in CI regardless of the runner's OS.
const modKey = isMac ? 'metaKey' : 'ctrlKey'

function Harness({ combo, onFire, options }) {
  useKeyboardShortcut(combo, onFire, options)
  return (
    <div>
      <input data-testid="text-input" />
    </div>
  )
}

describe('useKeyboardShortcut', () => {
  it('fires the handler on a bare key like Escape', async () => {
    const onFire = vi.fn()
    render(<Harness combo="Escape" onFire={onFire} />)
    await userEvent.keyboard('{Escape}')
    expect(onFire).toHaveBeenCalledTimes(1)
  })

  it('requires the primary modifier for a mod+ combo -- a bare key press is not enough', async () => {
    const onFire = vi.fn()
    render(<Harness combo="mod+k" onFire={onFire} options={{ allowInEditable: true }} />)
    await userEvent.keyboard('k')
    expect(onFire).not.toHaveBeenCalled()
  })

  it('does not fire a bare key while focus is inside a text input', async () => {
    const onFire = vi.fn()
    render(<Harness combo="Backspace" onFire={onFire} />)
    await userEvent.click(screen.getByTestId('text-input'))
    await userEvent.keyboard('{Backspace}')
    expect(onFire).not.toHaveBeenCalled()
  })

  it('does fire a bare key once focus leaves the input', async () => {
    const onFire = vi.fn()
    render(<Harness combo="Backspace" onFire={onFire} />)
    await userEvent.keyboard('{Backspace}')
    expect(onFire).toHaveBeenCalledTimes(1)
  })

  it('allowInEditable lets a combo fire even while a text input has focus', async () => {
    const onFire = vi.fn()
    render(<Harness combo="Escape" onFire={onFire} options={{ allowInEditable: true }} />)
    await userEvent.click(screen.getByTestId('text-input'))
    await userEvent.keyboard('{Escape}')
    expect(onFire).toHaveBeenCalledTimes(1)
  })

  it('does not fire at all while disabled', async () => {
    const onFire = vi.fn()
    render(<Harness combo="Escape" onFire={onFire} options={{ enabled: false }} />)
    await userEvent.keyboard('{Escape}')
    expect(onFire).not.toHaveBeenCalled()
  })

  it('a mod+ combo fires only with the platform-correct modifier held', () => {
    const onFire = vi.fn()
    render(<Harness combo="mod+k" onFire={onFire} />)
    const event = new KeyboardEvent('keydown', { key: 'k', bubbles: true, [modKey]: true })
    window.dispatchEvent(event)
    expect(onFire).toHaveBeenCalledTimes(1)
  })

  it('a shift+mod+ combo requires both modifiers', () => {
    const onFire = vi.fn()
    render(<Harness combo="shift+mod+z" onFire={onFire} />)
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', bubbles: true, [modKey]: true }))
    expect(onFire).not.toHaveBeenCalled()
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', bubbles: true, [modKey]: true, shiftKey: true }))
    expect(onFire).toHaveBeenCalledTimes(1)
  })
})
