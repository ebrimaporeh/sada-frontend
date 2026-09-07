import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { ReturnToSitePanel } from './ReturnToSitePanel'

describe('ReturnToSitePanel', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows the destination hostname and counts down', () => {
    render(<ReturnToSitePanel url="https://example.com/donate-page" />)
    expect(screen.getByText('example.com')).toBeInTheDocument()
    expect(screen.getByText(/in 5s/)).toBeInTheDocument()

    act(() => { vi.advanceTimersByTime(1000) })
    expect(screen.getByText(/in 4s/)).toBeInTheDocument()
  })

  it('auto-redirects once the countdown reaches zero', () => {
    delete window.location
    window.location = { href: '' }
    render(<ReturnToSitePanel url="https://example.com/donate-page" />)

    for (let i = 0; i < 5; i += 1) {
      act(() => { vi.advanceTimersByTime(1000) })
    }
    expect(window.location.href).toBe('https://example.com/donate-page')
  })

  it('cancels the countdown when "Stay here" is clicked', () => {
    delete window.location
    window.location = { href: '' }
    render(<ReturnToSitePanel url="https://example.com/donate-page" />)

    fireEvent.click(screen.getByRole('button', { name: /stay here/i }))
    expect(screen.getByText('Staying here.')).toBeInTheDocument()

    act(() => { vi.advanceTimersByTime(10000) })
    expect(window.location.href).toBe('')
  })

  it('renders nothing for a malformed url', () => {
    const { container } = render(<ReturnToSitePanel url="not-a-url" />)
    expect(container).toBeEmptyDOMElement()
  })
})
