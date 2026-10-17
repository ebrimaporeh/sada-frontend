import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConfirmModal } from './ConfirmModal'

describe('ConfirmModal', () => {
  it('renders nothing while closed, and does not respond to Escape/Enter', async () => {
    const onClose = vi.fn()
    const onConfirm = vi.fn()
    render(<ConfirmModal isOpen={false} onClose={onClose} onConfirm={onConfirm} />)
    await userEvent.keyboard('{Escape}')
    await userEvent.keyboard('{Enter}')
    expect(onClose).not.toHaveBeenCalled()
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('Escape closes the modal', async () => {
    const onClose = vi.fn()
    render(<ConfirmModal isOpen onClose={onClose} onConfirm={vi.fn()} />)
    await userEvent.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('Enter confirms the modal\'s primary action', async () => {
    const onConfirm = vi.fn()
    render(<ConfirmModal isOpen onClose={vi.fn()} onConfirm={onConfirm} />)
    await userEvent.keyboard('{Enter}')
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('neither shortcut fires while a confirm is already in progress', async () => {
    const onClose = vi.fn()
    const onConfirm = vi.fn()
    render(<ConfirmModal isOpen isLoading onClose={onClose} onConfirm={onConfirm} />)
    await userEvent.keyboard('{Escape}')
    await userEvent.keyboard('{Enter}')
    expect(onClose).not.toHaveBeenCalled()
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('shows the Esc/Enter hints on the Cancel/Confirm buttons', () => {
    render(<ConfirmModal isOpen onClose={vi.fn()} onConfirm={vi.fn()} />)
    expect(screen.getByText('Esc')).toBeInTheDocument()
    expect(screen.getByText('↵')).toBeInTheDocument()
  })

  it('hides the hints while a confirm is in progress', () => {
    render(<ConfirmModal isOpen isLoading onClose={vi.fn()} onConfirm={vi.fn()} />)
    expect(screen.queryByText('Esc')).not.toBeInTheDocument()
    expect(screen.queryByText('↵')).not.toBeInTheDocument()
  })
})
