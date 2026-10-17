import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { KeyHint } from './KeyHint'
import { isMac } from '@/hooks/useKeyboardShortcut'

describe('KeyHint', () => {
  it('renders a bare key as-is', () => {
    render(<KeyHint combo="Escape" />)
    expect(screen.getByText('Esc')).toBeInTheDocument()
  })

  it('renders a mod+ combo using the platform-correct modifier and join style', () => {
    render(<KeyHint combo="mod+k" />)
    expect(screen.getByText(isMac ? '⌘K' : 'Ctrl+K')).toBeInTheDocument()
  })

  it('renders a shift+mod+ combo with both modifiers, in the order the combo string lists them', () => {
    render(<KeyHint combo="shift+mod+z" />)
    expect(screen.getByText(isMac ? '⇧⌘Z' : 'Shift+Ctrl+Z')).toBeInTheDocument()
  })
})
