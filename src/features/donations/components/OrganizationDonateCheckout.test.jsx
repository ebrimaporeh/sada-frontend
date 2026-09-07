import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { OrganizationDonateCheckout } from './OrganizationDonateCheckout'

// Mirrors DonateCheckout.test.jsx's mock setup -- this suite only covers
// what differs (amount presets, `embedded` mode), not the shared
// validation/submit behavior already locked down there.

vi.mock('@tanstack/react-router', () => ({
  useSearch: () => ({}),
  Link: ({ children }) => <a>{children}</a>,
}))

vi.mock('@/hooks/useAuth', () => ({
  useMe: () => ({ data: undefined }),
}))

vi.mock('@/hooks/usePageMeta', () => ({
  usePageMeta: () => {},
}))

const mutate = vi.fn()
vi.mock('@/hooks/useDonations', () => ({
  useDonateToOrganization: () => ({ mutate, isPending: false }),
}))

vi.mock('@/hooks/usePayments', () => ({
  useDonationMethods: () => ({
    methods: [
      { id: 'wave', name: 'Wave', gateway: 'modempay', requiresPhone: true, color: 'bg-blue-500', short: 'W' },
    ],
    isLoading: false,
  }),
}))

const organization = {
  id: 'o1',
  slug: 'gambia-youth-trust',
  organization_name: 'Gambia Youth Trust',
  total_raised: 8000,
}

describe('OrganizationDonateCheckout', () => {
  beforeEach(() => {
    mutate.mockClear()
  })

  it('renders a compact layout with a Close button instead of a back link when embedded', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    render(<OrganizationDonateCheckout organization={organization} embedded onCancel={onCancel} />)

    expect(screen.getByText('Support Gambia Youth Trust')).toBeInTheDocument()
    expect(screen.queryByText('Back')).not.toBeInTheDocument()
    expect(screen.queryByText("You're supporting")).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /close/i }))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('falls back to the destination title when organization_name is missing', () => {
    render(<OrganizationDonateCheckout organization={{ id: 'o2', title: 'Serrekunda CDA' }} embedded onCancel={() => {}} />)
    expect(screen.getByText('Support Serrekunda CDA')).toBeInTheDocument()
  })

  it('includes embed_id in the submitted payload when embedded via a widget', async () => {
    const user = userEvent.setup()
    render(<OrganizationDonateCheckout organization={organization} embedded onCancel={() => {}} embedId="embed-456" />)

    await user.click(screen.getByText('D 100'))
    await user.click(screen.getByText('Donate anonymously'))
    await user.type(screen.getByPlaceholderText('7XXXXXXX'), '7123456')
    await user.click(screen.getByRole('button', { name: /donate/i }))

    expect(mutate).toHaveBeenCalledTimes(1)
    expect(mutate.mock.calls[0][0]).toMatchObject({ embed_id: 'embed-456' })
  })
})
