import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FundraisingWidget } from './FundraisingWidget'

// Clicking Donate now renders the real DonateCheckout/OrganizationDonateCheckout
// (see DonateModal.jsx) instead of navigating away, so their dependencies
// need the same mocks DonateCheckout.test.jsx uses -- this suite only cares
// that the modal opens with the right content, not the donation form's own
// validation (already covered there).
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

vi.mock('@/hooks/useDonations', () => ({
  useDonateToCampaign: () => ({ mutate: vi.fn(), isPending: false }),
  useDonateToOrganization: () => ({ mutate: vi.fn(), isPending: false }),
}))

vi.mock('@/hooks/usePayments', () => ({
  useDonationMethods: () => ({ methods: [], isLoading: false }),
}))

function makeEmbed({ destination, configuration, ...rest } = {}) {
  return {
    id: 'e1',
    layout: 'card',
    is_active: true,
    ...rest,
    configuration: { ...configuration },
    destination: {
      type: 'campaign',
      title: 'Flood Relief Fund',
      description: 'Help families in Basse.',
      cover_image_url: null,
      raised: 2500,
      goal: 10000,
      donation_url: 'https://dolelma.org/donate/flood-relief',
      ...destination,
    },
  }
}

describe('FundraisingWidget', () => {
  it('shows the destination title and description by default', () => {
    render(<FundraisingWidget embed={makeEmbed()} />)
    expect(screen.getByText('Flood Relief Fund')).toBeInTheDocument()
    expect(screen.getByText('Help families in Basse.')).toBeInTheDocument()
  })

  it('content overrides win over the destination fields', () => {
    render(<FundraisingWidget embed={makeEmbed({ configuration: { content: { title: 'Support our mission' } } })} />)
    expect(screen.getByText('Support our mission')).toBeInTheDocument()
    expect(screen.queryByText('Flood Relief Fund')).not.toBeInTheDocument()
  })

  it('shows progress for a campaign destination', () => {
    render(<FundraisingWidget embed={makeEmbed()} />)
    expect(screen.getByText(/raised of/)).toBeInTheDocument()
  })

  it('omits progress for an organization destination', () => {
    render(<FundraisingWidget embed={makeEmbed({ destination: { type: 'organization', raised: null, goal: null } })} />)
    expect(screen.queryByText(/raised of/)).not.toBeInTheDocument()
  })

  it('shows an inactive message and no Donate control when the embed is inactive', () => {
    render(<FundraisingWidget embed={makeEmbed({ is_active: false })} />)
    expect(screen.getByText(/no longer active/)).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('opens the in-place donate modal when interactive (the public page)', async () => {
    const user = userEvent.setup()
    render(<FundraisingWidget embed={makeEmbed()} interactive />)
    expect(screen.queryByText('Make a Donation')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Donate' }))
    expect(await screen.findByText('Make a Donation')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /close/i }))
    expect(screen.queryByText('Make a Donation')).not.toBeInTheDocument()
  })

  it('opens the organization donate modal for an organization destination', async () => {
    const user = userEvent.setup()
    render(<FundraisingWidget embed={makeEmbed({ destination: { type: 'organization', raised: null, goal: null } })} interactive />)

    await user.click(screen.getByRole('button', { name: 'Donate' }))
    expect(await screen.findByText(/Support Flood Relief Fund/)).toBeInTheDocument()
  })

  it('renders a non-navigating look-alike when not interactive (Studio preview)', () => {
    render(<FundraisingWidget embed={makeEmbed()} interactive={false} />)
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(screen.getByText('Donate')).toBeInTheDocument()
  })

  it.each(['card', 'compact', 'wide', 'horizontal', 'progress_focused'])(
    'renders the %s layout without crashing',
    (layout) => {
      render(<FundraisingWidget embed={makeEmbed({ layout })} />)
      expect(screen.getByText('Flood Relief Fund')).toBeInTheDocument()
    },
  )

  it('uses the custom donate button label when configured', () => {
    render(<FundraisingWidget embed={makeEmbed({ configuration: { content: { donateButtonText: 'Give Now' } } })} />)
    expect(screen.getByRole('button', { name: 'Give Now' })).toBeInTheDocument()
  })
})
