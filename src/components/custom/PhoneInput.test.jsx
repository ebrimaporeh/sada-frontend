import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PhoneInput } from './PhoneInput'

describe('PhoneInput', () => {
  it('shows the static +220 prefix', () => {
    render(<PhoneInput value="" onChange={vi.fn()} />)
    expect(screen.getByText('+220')).toBeInTheDocument()
  })

  it('strips non-digits and caps input at 9 digits', () => {
    const onChange = vi.fn()
    render(<PhoneInput value="" onChange={onChange} />)
    fireEvent.change(screen.getByPlaceholderText('8XXXXXXXX'), { target: { value: '87-700-0000x9' } })
    expect(onChange).toHaveBeenCalledWith('877000000')
  })

  it('shows no error for a blank value', () => {
    render(<PhoneInput value="" onChange={vi.fn()} />)
    expect(screen.queryByText(/9 digits, starting with 8/i)).not.toBeInTheDocument()
  })

  it('shows an inline error for a non-blank, invalid value', () => {
    render(<PhoneInput value="770000" onChange={vi.fn()} />)
    expect(screen.getByText(/9 digits, starting with 8/i)).toBeInTheDocument()
  })

  it('shows no error for a valid value', () => {
    render(<PhoneInput value="877000000" onChange={vi.fn()} />)
    expect(screen.queryByText(/9 digits, starting with 8/i)).not.toBeInTheDocument()
  })

  it('suppresses the inline error entirely when showError is false', () => {
    render(<PhoneInput value="770000" onChange={vi.fn()} showError={false} />)
    expect(screen.queryByText(/9 digits, starting with 8/i)).not.toBeInTheDocument()
  })
})
