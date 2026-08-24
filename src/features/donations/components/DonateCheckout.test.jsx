import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DonateCheckout } from './DonateCheckout'

// This form's validation (handleDonate in DonateCheckout.jsx) is the last
// line of defense before real money moves through a payment gateway, so
// it's the highest-value thing to lock down with tests in this codebase.

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
  useDonateToCampaign: () => ({ mutate, isPending: false }),
}))

vi.mock('@/hooks/usePayments', () => ({
  useDonationMethods: () => ({
    methods: [
      { id: 'wave', name: 'Wave', gateway: 'modempay', requiresPhone: true, color: 'bg-blue-500', short: 'W' },
    ],
    isLoading: false,
  }),
}))

const campaign = {
  id: 'c1',
  slug: 'clean-water-for-basse',
  title: 'Clean Water for Basse',
  region: 'Basse',
  category: 'Community',
  raised: 12000,
  goal: 50000,
  donors_count: 42,
  deadline: '2099-01-01',
  images: [],
}

describe('DonateCheckout', () => {
  beforeEach(() => {
    mutate.mockClear()
  })

  it('rejects an amount below the platform minimum', async () => {
    const user = userEvent.setup()
    render(<DonateCheckout campaign={campaign} />)

    await user.type(screen.getByPlaceholderText('Amount'), '10')
    await user.type(screen.getByPlaceholderText('Full name'), 'Amie Jallow')
    await user.click(screen.getByRole('button', { name: /donate/i }))

    expect(await screen.findByText(/minimum donation is/i)).toBeInTheDocument()
    expect(mutate).not.toHaveBeenCalled()
  })

  it('rejects an amount above the per-transaction maximum', async () => {
    const user = userEvent.setup()
    render(<DonateCheckout campaign={campaign} />)

    await user.type(screen.getByPlaceholderText('Amount'), '999999')
    await user.type(screen.getByPlaceholderText('Full name'), 'Amie Jallow')
    await user.click(screen.getByRole('button', { name: /donate/i }))

    expect(await screen.findByText(/maximum donation is/i)).toBeInTheDocument()
    expect(mutate).not.toHaveBeenCalled()
  })

  it('requires a name unless donating anonymously', async () => {
    const user = userEvent.setup()
    render(<DonateCheckout campaign={campaign} />)

    await user.type(screen.getByPlaceholderText('Amount'), '500')
    await user.click(screen.getByRole('button', { name: /donate/i }))

    expect(await screen.findByText(/enter your name or choose to donate anonymously/i)).toBeInTheDocument()
    expect(mutate).not.toHaveBeenCalled()
  })

  it('allows an anonymous donor to skip the name field', async () => {
    const user = userEvent.setup()
    render(<DonateCheckout campaign={campaign} />)

    await user.type(screen.getByPlaceholderText('Amount'), '500')
    await user.click(screen.getByText('Donate anonymously'))
    await user.type(screen.getByPlaceholderText('7XXXXXXX'), '7123456')
    await user.click(screen.getByRole('button', { name: /donate/i }))

    expect(screen.queryByText(/enter your name/i)).not.toBeInTheDocument()
    expect(mutate).toHaveBeenCalledTimes(1)
    expect(mutate.mock.calls[0][0]).toMatchObject({
      campaign_id: 'c1',
      amount: 500,
      is_anonymous: true,
      donor_name: '',
    })
  })

  it('requires a phone number for a mobile-money method', async () => {
    const user = userEvent.setup()
    render(<DonateCheckout campaign={campaign} />)

    await user.type(screen.getByPlaceholderText('Amount'), '500')
    await user.type(screen.getByPlaceholderText('Full name'), 'Amie Jallow')
    await user.click(screen.getByRole('button', { name: /donate/i }))

    expect(await screen.findByText(/enter a valid phone number/i)).toBeInTheDocument()
    expect(mutate).not.toHaveBeenCalled()
  })

  it('submits with the +220 country code prefixed onto the phone number', async () => {
    const user = userEvent.setup()
    render(<DonateCheckout campaign={campaign} />)

    await user.type(screen.getByPlaceholderText('Amount'), '750')
    await user.type(screen.getByPlaceholderText('Full name'), 'Amie Jallow')
    await user.type(screen.getByPlaceholderText('7XXXXXXX'), '7123456')
    await user.click(screen.getByRole('button', { name: /donate/i }))

    expect(mutate).toHaveBeenCalledTimes(1)
    expect(mutate.mock.calls[0][0]).toMatchObject({
      amount: 750,
      phone: '+2207123456',
      donor_name: 'Amie Jallow',
      gateway: 'modempay',
    })
  })
})
